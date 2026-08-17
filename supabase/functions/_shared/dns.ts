// Shared DNS-zone provisioning for .kred domains.
//
// Registering a domain at api.domains.kred only creates the registry object and
// delegates it to the PeopleBrowsr nameservers - it does NOT create a hosted
// zone. Without a zone the nameservers answer REFUSED (lame delegation) and the
// domain does not resolve at all. Every claimed .kred page therefore needs a
// zone with an apex A record (plus `www`) pointing at the Kredentials front end.
//
// Only the domain holder's own access token can touch the zone (the platform
// API token is not the holder), so these helpers always take the user token.

export const API_BASE = 'https://api.domains.kred';

/** Front-end host that serves Kredentials pages (kredentials.kred A record). */
export const KRED_SITE_IP = '173.231.58.170';

function holderHeaders(userToken: string, adminToken?: string, onBehalfOf?: string): Record<string, string> {
  return {
    Authorization: `Bearer ${userToken}`,
    'Content-Type': 'application/json',
    ...(adminToken ? { 'X-Admin-Token': adminToken } : {}),
    ...(onBehalfOf ? { 'X-On-Behalf-Of': onBehalfOf } : {}),
  };
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export interface ZoneStatus {
  /** True when the zone exists and already has apex + www A records. */
  ok: boolean;
  exists: boolean;
  hasApex: boolean;
  hasWww: boolean;
  records: unknown;
}

/** Resolve an A record through a public resolver (source of truth for serving). */
export async function resolvesA(host: string): Promise<boolean> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { Status?: number; Answer?: Array<{ type?: number }> };
    return body.Status === 0 && (body.Answer || []).some((a) => a.type === 1);
  } catch {
    return false;
  }
}

/**
 * Inspect a zone. The registry's record-list endpoint returns 500 for some
 * zones, so when it fails we fall back to public DNS - what actually resolves
 * is what the serving layer sees.
 */
export async function inspectZone(
  domain: string,
  userToken: string,
  adminToken?: string,
  onBehalfOf?: string,
): Promise<ZoneStatus> {
  const res = await fetch(`${API_BASE}/dns/zone/${encodeURIComponent(domain)}/records`, {
    headers: holderHeaders(userToken, adminToken, onBehalfOf),
  });
  const records = await readJson(res);
  if (!res.ok) {
    const [hasApex, hasWww] = await Promise.all([resolvesA(domain), resolvesA(`www.${domain}`)]);
    return { ok: hasApex && hasWww, exists: hasApex || hasWww, hasApex, hasWww, records };
  }
  const list = (records as { records?: Array<{ name?: string | null; type?: string | null }> })?.records ?? [];
  const isA = (r: { type?: string | null }) => (r.type || '').toUpperCase() === 'A';
  const hasApex = list.some(
    (r) => isA(r) && (!r.name || r.name === domain || r.name === '@' || r.name === `${domain}.`),
  );
  // The .kred serving layer only maps a hostname once the zone carries both the
  // apex and the `www` A record - an apex-only zone resolves but 303-loops.
  const hasWww = list.some(
    (r) => isA(r) && (r.name === `www.${domain}` || r.name === `www.${domain}.` || r.name === 'www'),
  );
  return { ok: hasApex && hasWww, exists: true, hasApex, hasWww, records };
}

/**
 * Create a single A record via the auto-zone endpoint (`POST /dns/record`),
 * which takes the domain plus a relative record name. This is the only write
 * path the registry reliably persists for pre-existing zones.
 */
async function createRecord(
  domain: string,
  name: string,
  address: string,
  userToken: string,
  adminToken?: string,
): Promise<{ name: string; status: number; body: unknown }> {
  const res = await fetch(`${API_BASE}/dns/record`, {
    method: 'POST',
    headers: holderHeaders(userToken, adminToken),
    body: JSON.stringify({ domain, type: 'A', name, content: address, ttl: 3600 }),
  });
  return { name, status: res.status, body: await readJson(res) };
}


export interface ProvisionResult {
  domain: string
  created: boolean;
  alreadyOk: boolean;
  zone?: unknown;
  apex?: unknown;
  www?: unknown;
  error?: string;
}

/**
 * Ensure `domain` has a hosted zone with apex + www A records pointing at the
 * Kredentials front end. Idempotent: a zone that already resolves is left alone.
 */
export async function ensureDnsZone(
  domain: string,
  userToken: string,
  adminToken?: string,
  address: string = KRED_SITE_IP,
): Promise<ProvisionResult> {
  const zone = domain.trim().toLowerCase();
  const headers = holderHeaders(userToken, adminToken);

  const existing = await inspectZone(zone, userToken, adminToken);
  console.log(`[dns] pre-state for ${zone}`, JSON.stringify(existing));
  if (existing.ok) return { domain: zone, created: false, alreadyOk: true };


  let zoneBody: unknown = null;
  if (!existing.exists) {
    const zoneRes = await fetch(`${API_BASE}/dns/zone`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ zone, initial_address: address }),
    });
    zoneBody = await readJson(zoneRes);
    // A zone that already exists is not an error for our purposes. The registry
    // answers 409 *or* a bare 500 when the zone is already present, so never
    // bail out here - always fall through and write the records, which is what
    // actually fixes an incomplete zone.
    if (!zoneRes.ok) console.error(`[dns] zone create failed for ${zone} [${zoneRes.status}]`, zoneBody);
  }

  // Write apex + www through the auto-zone record endpoint. The zone-scoped
  // `records` / `records/set` endpoints report success but do not persist for
  // pre-existing zones; `POST /dns/record` takes a relative name and does.
  const writes: unknown[] = [];
  if (!existing.hasApex) writes.push(await createRecord(zone, '@', address, userToken, adminToken));
  if (!existing.hasWww) writes.push(await createRecord(zone, 'www', address, userToken, adminToken));
  console.log(`[dns] record writes for ${zone}`, JSON.stringify(writes));

  const after = await inspectZone(zone, userToken, adminToken);
  console.log(`[dns] post-write state for ${zone}`, JSON.stringify(after));

  return {
    domain: zone,
    created: !existing.exists,
    alreadyOk: false,
    zone: zoneBody,
    apex: writes,
    // Public DNS caches negatively for a few minutes, so a not-yet-ok read here
    // is not necessarily a failure - the next /manage visit re-checks.
    error: after.hasApex && after.hasWww ? undefined : 'records_pending',
  };
}

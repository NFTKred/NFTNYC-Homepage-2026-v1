/**
 * Speaker-flow API surface — ported from OneHub `src/lib/api/*`.
 * Talks to the legacy platform API (no Supabase involvement).
 */
import {
  BASE_URL,
  getApiToken,
  getChannel,
  getClaimsMiddleware,
  getToken,
  getUploadBaseUrls,
  getUserId,
} from './core';

// ─── File upload (port of pyntw.ts uploadFormBlob) ─────────────────────────
export function uploadFormBlob(
  name: string,
  blob: Blob,
  callback: (err: unknown, res?: { url?: string }, percentage?: number) => void,
): void {
  const formData = new FormData();
  formData.append('file', blob, name);
  formData.append('name', `${Date.now()}_${name.split(' ').join('')}`);
  formData.append('token', getApiToken());

  const uploadUrls = getUploadBaseUrls();
  let urlIndex = 0;

  const upload = () => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (evt) => {
      if (evt.lengthComputable) {
        callback(null, {}, Math.floor((evt.loaded / evt.total) * 100));
      }
    });
    xhr.onload = () => {
      const status = xhr.status;
      const bodyPreview = (xhr.responseText || '').slice(0, 500);
      try {
        const res = JSON.parse(xhr.responseText);
        const errorMessage =
          res.error || res.message || (status >= 400 ? `Upload failed (HTTP ${status})` : '');
        if (errorMessage) {
          if (status >= 400 && urlIndex < uploadUrls.length - 1) {
            urlIndex += 1;
            upload();
            return;
          }
          callback(errorMessage);
          return;
        }
        callback(null, res);
      } catch {
        if (urlIndex < uploadUrls.length - 1) {
          urlIndex += 1;
          upload();
          return;
        }
        callback(`Upload failed (HTTP ${status}): ${bodyPreview.slice(0, 200) || 'no body'}`);
      }
    };
    xhr.onerror = () => {
      if (urlIndex < uploadUrls.length - 1) {
        urlIndex += 1;
        upload();
        return;
      }
      callback('Upload failed (network error)');
    };
    xhr.open('POST', `${uploadUrls[urlIndex]}/file/upload_form`, true);
    xhr.send(formData);
  };

  upload();
}

/** Convenience promise wrapper around `uploadFormBlob`. */
export function uploadBlob(name: string, blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    uploadFormBlob(name, blob, (err, res, percentage) => {
      if (err) return reject(err instanceof Error ? err : new Error(String(err)));
      const url = res?.url || (res as { file?: { url?: string } } | undefined)?.file?.url;
      if (percentage !== undefined && !url) return;
      if (!url) return reject(new Error('Upload succeeded but no URL returned'));
      resolve(url);
    });
  });
}

// ─── Speaker submission metadata (port of hubSettings.ts) ──────────────────
export async function setSpeakerSubmissionData(
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({ infotype: 'speaker', token: getApiToken() });
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }
  const response = await fetch(`${getClaimsMiddleware()}/set_info/dotceo?${params.toString()}`);
  const json = await response.json();
  if (json?.error) throw new Error(json.error_description || json.error || json.message);
  return json || {};
}

// ─── Sessionize speaker lookup (port of account.ts getSessionizeData) ──────
export async function getSessionizeData(): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({ token: getApiToken(), channel: getChannel() });
  try {
    const response = await fetch(
      `${getClaimsMiddleware()}/speaker_check/dotceo?${params.toString()}`,
    );
    const data = await response.json();
    if (data?.error) return null;
    return data || null;
  } catch {
    return null;
  }
}

// ─── Domain registration (port of profile.ts) ──────────────────────────────
export async function registerDomain(domain: string): Promise<Record<string, unknown>> {
  const trimmedDomain = domain?.trim();
  if (!trimmedDomain) throw new Error('Domain is required');

  const params = new URLSearchParams({ domain: trimmedDomain, token: getToken() });
  const response = await fetch(`${getClaimsMiddleware()}/quick_kred/dotceo?${params.toString()}`);
  const data = await response.json();

  const errorMessage = data?.error?.message || data?.error;
  if (errorMessage) throw new Error(errorMessage);
  return data || {};
}

export async function fetchDomainRecord(domain: string) {
  const params = new URLSearchParams({
    domain: domain?.toLowerCase(),
    token: getApiToken(),
  });
  const response = await fetch(`${BASE_URL}/domain/find?${params.toString()}`);
  const data = await response.json();
  return data?.domain || null;
}

/** True when the .kred name is still unclaimed. */
export async function isDomainAvailable(domain: string): Promise<boolean> {
  try {
    const record = await fetchDomainRecord(domain);
    return !record;
  } catch {
    return false;
  }
}

// ─── Kredentials pages (port of kredentials.ts) ────────────────────────────
export interface KredentialsPageDomain {
  id: string;
  name: string;
  user?: string | { id?: string };
  data?: Record<string, unknown>;
}

export async function fetchKredentialsPages(
  page = 1,
  count = 40,
): Promise<KredentialsPageDomain[]> {
  const token = getApiToken();
  if (!token) return [];
  const params = new URLSearchParams({ count: String(count), page: String(page), token });
  const response = await fetch(`${BASE_URL}/nft/kredentials_pages?${params.toString()}`);
  if (!response.ok) throw new Error(`Failed to load Kredentials pages (${response.status})`);
  const data = await response.json();
  if (data?.error) throw new Error(data.error_description || data.error);
  return Array.isArray(data?.domains) ? data.domains : [];
}

function domainUserId(d: KredentialsPageDomain): string | null {
  if (!d?.user) return null;
  if (typeof d.user === 'string') return d.user;
  return d.user.id || null;
}

export async function getMyKredentialsDomain(): Promise<KredentialsPageDomain | null> {
  const userId = getUserId();
  if (!userId) return null;
  try {
    const domains = await fetchKredentialsPages(1, 40);
    const mine = domains.filter((d) => domainUserId(d) === userId);
    const canonical = mine.find((d) => /^[a-z0-9-]+\.kred$/i.test((d?.name || '').trim()));
    return canonical || mine[0] || null;
  } catch {
    return null;
  }
}

export async function hasActivatedKredentials(): Promise<boolean> {
  return !!(await getMyKredentialsDomain());
}
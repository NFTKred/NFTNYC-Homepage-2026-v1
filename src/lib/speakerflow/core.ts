/**
 * Minimal port of the OneHub `src/lib/api/core.ts` + `src/lib/auth.ts` token
 * layer, scoped to the speaker submission flow. Only the pieces the flow
 * actually needs are carried across.
 */

export const GUEST_TOKEN = '734d4bf5-e766-46a9-be21-94035c1343d6';
export const BASE_URL = 'https://api.nftplatform.tech';
export const GRAB_API_URL = 'https://api.grab.live';
export const CLAIMS_MIDDLEWARE = 'https://claim.peoplebrowsr.com';

type PlatformWindow = Window & {
  token?: string;
  domain?: string;
  branding?: Record<string, unknown>;
};

function w(): PlatformWindow {
  return window as unknown as PlatformWindow;
}

/** Legacy platform auth token (set by the login hub). Falls back to guest. */
export function getToken(): string {
  return w().token || localStorage.getItem('pb_token') || GUEST_TOKEN;
}

export function setToken(token: string | null): void {
  w().token = token || undefined;
  if (token) localStorage.setItem('pb_token', token);
  else localStorage.removeItem('pb_token');
}

export function isLoggedIn(): boolean {
  const t = getToken();
  return !!t && t !== GUEST_TOKEN && !t.includes('guest');
}

export function getUserId(): string | null {
  return localStorage.getItem('userId');
}

export function getApiToken(): string {
  const token = getToken();
  if (!token || token.includes('guest')) return GUEST_TOKEN;
  return token;
}

export function getClaimsMiddleware(): string {
  return (w().branding?.claims_hub_url as string) || CLAIMS_MIDDLEWARE;
}

export function getChannel(): string {
  return w().domain || window.location.hostname || '';
}

/** Upload host candidates — hub domain first when present, then platform hosts. */
export function getUploadBaseUrls(): string[] {
  const domain = w().domain;
  if (domain && !/lovableproject\.com$|lovable\.app$|^localhost$|^127\.0\.0\.1$/i.test(domain)) {
    return [`https://${domain}`];
  }
  return [BASE_URL, GRAB_API_URL];
}
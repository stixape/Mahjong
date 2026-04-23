export const APP_BASE = import.meta.env.BASE_URL;

export function assetUrl(path: string): string {
  return `${APP_BASE}${path.replace(/^\/+/, '')}`;
}

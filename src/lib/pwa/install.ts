export const APP_NAME = "Treino CDCP";
export const STORAGE_KEY = "cdcp-pwa-dismissed";
export const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const PROMPT_DELAY_MS = 2200;
export const SW_PATH = "/sw.js";

export type InstallKind = "hidden" | "native" | "ios" | "android";
export const DEBUG_PARAM = "pwa";

export type InstallEnv = {
  standalone: boolean;
  embedded: boolean;
  ios: boolean;
  android: boolean;
  hasNativePrompt: boolean;
  dismissed: boolean;
  force?: boolean;
};

export type MediaQueryListLike = { matches: boolean };

export type StandaloneHost = {
  matchMedia?: (query: string) => MediaQueryListLike;
  navigator?: { standalone?: boolean };
};

export type IosHost = {
  userAgent: string;
  maxTouchPoints?: number;
};

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
};

export function resolveInstallKind(env: InstallEnv): InstallKind {
  if (env.standalone || env.embedded) return "hidden";
  if (env.dismissed && !env.force) return "hidden";
  if (env.hasNativePrompt) return "native";
  if (env.ios) return "ios";
  if (env.android) return "android";
  if (env.force) return "android";
  return "hidden";
}

export function shouldRegisterServiceWorker(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0] ?? "";
  return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
}

export function isStandaloneDisplay(host: StandaloneHost): boolean {
  try {
    if (host.matchMedia?.("(display-mode: standalone)").matches) return true;
    if (host.matchMedia?.("(display-mode: fullscreen)").matches) return true;
    if (host.matchMedia?.("(display-mode: minimal-ui)").matches) return true;
  } catch {
    // matchMedia pode falhar em testes/SSR
  }
  return Boolean(host.navigator?.standalone);
}

export function isIosDevice(host: IosHost): boolean {
  const ua = host.userAgent;
  if (/iPhone|iPod|iPad/i.test(ua)) return true;
  return /Macintosh/i.test(ua) && (host.maxTouchPoints ?? 0) > 1;
}

export function isAndroidDevice(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

export function isEmbeddedFrame(win: { self: unknown; top: unknown } | null | undefined): boolean {
  if (!win) return false;
  try {
    return win.self !== win.top;
  } catch {
    return true;
  }
}

export function hasForceQuery(search: string): boolean {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return params.get(DEBUG_PARAM) === "1" || params.get("debug_pwa") === "1";
}

export function readDismissedAt(storage: StorageLike): number | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function writeDismissedAt(storage: StorageLike, at: number): void {
  storage.setItem?.(STORAGE_KEY, String(at));
}

export function isDismissed(at: number | null, now: number, ttl = DISMISS_TTL_MS): boolean {
  if (at === null) return false;
  return now - at < ttl;
}

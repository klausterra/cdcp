/**
 * Matomo Hipercube — Treino CDCP (site id 29).
 * Sem PII: nunca enviar e-mail, telefone, nome ou tokens.
 */

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

export const MATOMO_SITE_ID = "29";
export const MATOMO_HOST = "//matomo.hipercube.ia.br/";
export const PRODUCTION_ANALYTICS_HOSTS = ["cdcp.hipercube.ia.br", "cdcp-cnn.pages.dev"] as const;
export const PASS_THRESHOLD = 68;
export const MATOMO_SCRIPT_ATTR = "hipercube";

const BLOCKED_KEYS = new Set([
  "email",
  "token",
  "oobcode",
  "apikey",
  "password",
  "phone",
  "whatsapp",
  "name",
  "telefone",
]);

function paq(): unknown[][] | undefined {
  if (typeof window === "undefined") return undefined;
  window._paq = window._paq ?? [];
  return window._paq;
}

export function shouldTrack(hostname?: string, search?: string): boolean {
  const host = (hostname ?? (typeof window === "undefined" ? "" : window.location.hostname)).toLowerCase();
  const query = search ?? (typeof window === "undefined" ? "" : window.location.search);
  if (new URLSearchParams(query).get("__force_analytics") === "1") return true;
  return (PRODUCTION_ANALYTICS_HOSTS as readonly string[]).includes(host);
}

export function sanitizeAnalyticsUrl(pathnameAndSearch: string): string {
  const raw = pathnameAndSearch.startsWith("http")
    ? pathnameAndSearch
    : `https://${PRODUCTION_ANALYTICS_HOSTS[0]}${pathnameAndSearch.startsWith("/") ? "" : "/"}${pathnameAndSearch}`;
  try {
    const url = new URL(raw);
    for (const key of [...url.searchParams.keys()]) {
      if (BLOCKED_KEYS.has(key.toLowerCase())) url.searchParams.delete(key);
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return pathnameAndSearch.split("?")[0] ?? "/";
  }
}

function push(...args: unknown[]): void {
  const q = paq();
  if (!q) return;
  q.push(args);
}

export function installTracker(): void {
  if (!shouldTrack()) return;
  if (typeof document === "undefined") return;
  push("enableHeartBeatTimer", 15);
  push("enableLinkTracking");
  push("setTrackerUrl", `${MATOMO_HOST}matomo.php`);
  push("setSiteId", MATOMO_SITE_ID);
  if (document.querySelector(`script[data-matomo="${MATOMO_SCRIPT_ATTR}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `${MATOMO_HOST}matomo.js`;
  script.dataset.matomo = MATOMO_SCRIPT_ATTR;
  document.head.appendChild(script);
}

export function trackPageView(path?: string, title?: string): void {
  if (!shouldTrack()) return;
  try {
    const pathname =
      path ??
      (typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`);
    push("setCustomUrl", sanitizeAnalyticsUrl(pathname));
    if (title || typeof document !== "undefined") {
      push("setDocumentTitle", title ?? document.title);
    }
    push("trackPageView");
  } catch {
    // analytics nunca quebra a UX
  }
}

export function trackEvent(category: string, action: string, name?: string, value?: number): void {
  if (!shouldTrack()) return;
  try {
    if (name !== undefined && value !== undefined) push("trackEvent", category, action, name, value);
    else if (name !== undefined) push("trackEvent", category, action, name);
    else push("trackEvent", category, action);
  } catch {
    // analytics nunca quebra a UX
  }
}

export const cdcpAnalytics = {
  roundStart: (mode: string) => trackEvent("treino", "round_start", mode),
  roundComplete: (mode: string, scorePct: number) => {
    trackEvent("treino", "round_complete", mode, scorePct);
    if (mode === "prova" && scorePct >= PASS_THRESHOLD) {
      trackEvent("treino", "round_passed", mode, scorePct);
    }
  },
  modeSwitch: (mode: string) => trackEvent("treino", "mode_switch", mode),
  promoClick: (project: string) => trackEvent("cta", "promo_click", project),
  socialClick: (network: string) => trackEvent("cta", "social_click", network),
  pwaPromptShown: (kind: string) => trackEvent("pwa", "prompt_shown", kind),
  pwaInstallClick: (kind: string) => trackEvent("pwa", "install_click", kind),
  pwaDismiss: (kind: string) => trackEvent("pwa", "dismiss", kind),
  pwaInstalled: () => trackEvent("pwa", "installed"),
};

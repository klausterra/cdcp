import { SW_PATH, shouldRegisterServiceWorker } from "./install";

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (!shouldRegisterServiceWorker(window.location.hostname)) return;

  const register = () =>
    navigator.serviceWorker.register(SW_PATH, { scope: "/" }).catch(() => {
      // Sem SW o popup nativo não aparece; o fluxo iOS segue intacto.
    });

  if (document.readyState === "complete") {
    await register();
    return;
  }

  window.addEventListener("load", () => {
    void register();
  }, { once: true });
}

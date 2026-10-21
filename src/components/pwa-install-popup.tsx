import { useEffect, useId, useRef, useState } from "react";
import { Share, X } from "lucide-react";
import { cdcpAnalytics } from "@/lib/analytics";
import {
  APP_NAME,
  PROMPT_DELAY_MS,
  hasForceQuery,
  isAndroidDevice,
  isDismissed,
  isEmbeddedFrame,
  isIosDevice,
  isStandaloneDisplay,
  readDismissedAt,
  resolveInstallKind,
  writeDismissedAt,
  type InstallKind,
} from "@/lib/pwa/install";
import { registerServiceWorker } from "@/lib/pwa/register";

type NativeInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type View = "offer" | "howto";

function currentEnv(hasNativePrompt: boolean) {
  const ua = navigator.userAgent;
  return {
    standalone: isStandaloneDisplay({
      matchMedia: (query) => window.matchMedia(query),
      navigator: navigator as { standalone?: boolean },
    }),
    embedded: isEmbeddedFrame(window),
    ios: isIosDevice({ userAgent: ua, maxTouchPoints: navigator.maxTouchPoints }),
    android: isAndroidDevice(ua),
    hasNativePrompt,
    dismissed: isDismissed(readDismissedAt(localStorage), Date.now()),
    force: hasForceQuery(window.location.search),
  };
}

export function PwaInstallPopup() {
  const titleId = useId();
  const copyId = useId();
  const [kind, setKind] = useState<InstallKind>("hidden");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("offer");
  const [busy, setBusy] = useState(false);
  const nativeRef = useRef<NativeInstallPrompt | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const reveal = (next: InstallKind) => {
      if (cancelled || next === "hidden" || shownRef.current) return;
      shownRef.current = true;
      setKind(next);
      setOpen(true);
      cdcpAnalytics.pwaPromptShown(next);
    };

    const onPrompt = (event: Event) => {
      event.preventDefault();
      nativeRef.current = event as NativeInstallPrompt;
      reveal(resolveInstallKind(currentEnv(true)));
    };
    const onInstalled = () => {
      nativeRef.current = null;
      setOpen(false);
      setKind("hidden");
      cdcpAnalytics.pwaInstalled();
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    void registerServiceWorker();

    const delay = currentEnv(false).force ? 0 : PROMPT_DELAY_MS;
    const timer = window.setTimeout(() => {
      reveal(resolveInstallKind(currentEnv(Boolean(nativeRef.current))));
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    if (kind !== "hidden") cdcpAnalytics.pwaDismiss(kind);
    writeDismissedAt(localStorage, Date.now());
    setOpen(false);
    setView("offer");
  }

  async function install() {
    cdcpAnalytics.pwaInstallClick(kind);
    if (kind === "ios" || kind === "android" || !nativeRef.current) {
      setView("howto");
      return;
    }
    setBusy(true);
    try {
      const prompt = nativeRef.current;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      nativeRef.current = null;
      if (choice.outcome === "accepted") {
        setOpen(false);
        setKind("hidden");
        return;
      }
      setView("howto");
    } catch {
      setView("howto");
    } finally {
      setBusy(false);
    }
  }

  if (!open || kind === "hidden") return null;

  const ios = kind === "ios";
  const nativeReady = kind === "native" && Boolean(nativeRef.current);

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[22rem]"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={copyId}
    >
      <div className="rise relative overflow-hidden rounded-3xl border border-line bg-surface/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <button
          type="button"
          onClick={dismiss}
          className="press absolute top-3 right-3 grid size-11 place-items-center rounded-full text-muted hover:bg-bg hover:text-fg"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {view === "offer" ? (
          <>
            <div className="flex items-start gap-3 pr-10">
              <img
                src="/icons/icon-192.png"
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-2xl ring-1 ring-line"
              />
              <div>
                <p className="font-mono text-xs tracking-[0.16em] text-primary uppercase">App</p>
                <h2 id={titleId} className="mt-1 text-xl font-semibold">
                  Instalar {APP_NAME}
                </h2>
              </div>
            </div>
            <p id={copyId} className="mt-3 text-sm leading-relaxed text-pretty text-muted">
              Abre direto da tela inicial, sem barra do navegador. Melhor para treinar no celular entre as aulas.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => void install()}
                disabled={busy}
                className="press inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-5 font-semibold text-primary-ink disabled:opacity-60"
              >
                {nativeReady ? "Instalar" : "Como instalar"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="press min-h-11 rounded-lg px-3 text-sm font-medium text-muted"
              >
                Depois
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-xs tracking-[0.16em] text-primary uppercase">Instalação</p>
            <h2 id={titleId} className="mt-1 pr-10 text-xl font-semibold">
              {ios ? "No iPhone" : "No Android"}
            </h2>
            <ol id={copyId} className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted">
              {ios ? (
                <>
                  <li>
                    Toque em{" "}
                    <span className="inline-flex items-center gap-1 font-medium text-fg">
                      Compartilhar
                      <Share size={14} className="text-primary" aria-hidden />
                    </span>{" "}
                    na barra do Safari.
                  </li>
                  <li>
                    Escolha <span className="font-medium text-fg">Adicionar à Tela de Início</span>.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Abra o menu <span className="font-medium text-fg">⋮</span> do Chrome.
                  </li>
                  <li>
                    Toque em <span className="font-medium text-fg">Instalar aplicativo</span> ou{" "}
                    <span className="font-medium text-fg">Adicionar à tela inicial</span>.
                  </li>
                </>
              )}
            </ol>
            <button
              type="button"
              onClick={dismiss}
              className="press mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 font-semibold text-primary-ink"
            >
              Entendi
            </button>
          </>
        )}
      </div>
    </div>
  );
}

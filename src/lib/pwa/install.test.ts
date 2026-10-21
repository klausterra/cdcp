import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  APP_NAME,
  DISMISS_TTL_MS,
  STORAGE_KEY,
  hasForceQuery,
  isDismissed,
  isIosDevice,
  isStandaloneDisplay,
  readDismissedAt,
  resolveInstallKind,
  shouldRegisterServiceWorker,
  writeDismissedAt,
} from "./install.ts";

describe("resolveInstallKind", () => {
  const base = {
    standalone: false,
    embedded: false,
    ios: false,
    android: false,
    hasNativePrompt: false,
    dismissed: false,
    force: false,
  };

  it("esconde quando já está instalado", () => {
    assert.equal(resolveInstallKind({ ...base, standalone: true, ios: true, force: true }), "hidden");
  });

  it("esconde em iframe/preview", () => {
    assert.equal(resolveInstallKind({ ...base, embedded: true, hasNativePrompt: true }), "hidden");
  });

  it("esconde após dispensar, salvo force", () => {
    assert.equal(resolveInstallKind({ ...base, dismissed: true, ios: true }), "hidden");
    assert.equal(resolveInstallKind({ ...base, dismissed: true, ios: true, force: true }), "ios");
  });

  it("usa o prompt nativo quando o browser oferece", () => {
    assert.equal(resolveInstallKind({ ...base, hasNativePrompt: true }), "native");
  });

  it("usa o fluxo iOS quando não há prompt nativo", () => {
    assert.equal(resolveInstallKind({ ...base, ios: true }), "ios");
  });

  it("usa o fluxo Android quando não há prompt nativo", () => {
    assert.equal(resolveInstallKind({ ...base, android: true }), "android");
  });

  it("não mostra manual em desktop sem beforeinstallprompt", () => {
    assert.equal(resolveInstallKind(base), "hidden");
  });

  it("com ?pwa=1 mostra o guia para QA", () => {
    assert.equal(resolveInstallKind({ ...base, force: true }), "android");
  });
});

describe("detecção de ambiente", () => {
  it("reconhece standalone via matchMedia e navigator.standalone", () => {
    assert.equal(
      isStandaloneDisplay({
        matchMedia: (q: string) => ({ matches: q.includes("standalone") }),
        navigator: {},
      }),
      true,
    );
    assert.equal(
      isStandaloneDisplay({
        matchMedia: () => ({ matches: false }),
        navigator: { standalone: true },
      }),
      true,
    );
    assert.equal(
      isStandaloneDisplay({
        matchMedia: () => ({ matches: false }),
        navigator: {},
      }),
      false,
    );
  });

  it("reconhece iPhone, iPad clássico e iPadOS desktop-UA", () => {
    assert.equal(isIosDevice({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)", maxTouchPoints: 5 }), true);
    assert.equal(isIosDevice({ userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0)", maxTouchPoints: 5 }), true);
    assert.equal(
      isIosDevice({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", maxTouchPoints: 5 }),
      true,
    );
    assert.equal(
      isIosDevice({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120", maxTouchPoints: 0 }),
      false,
    );
  });
});

describe("dispensa", () => {
  it("persiste e expira depois do TTL", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };
    const now = 1_700_000_000_000;
    writeDismissedAt(storage, now);
    assert.equal(store.get(STORAGE_KEY), String(now));
    assert.equal(readDismissedAt(storage), now);
    assert.equal(isDismissed(now, now + 1_000), true);
    assert.equal(isDismissed(now, now + DISMISS_TTL_MS + 1), false);
  });

  it("trata valor inválido como não dispensado", () => {
    assert.equal(readDismissedAt({ getItem: () => "nope" }), null);
    assert.equal(isDismissed(null, Date.now()), false);
  });
});

describe("query de QA", () => {
  it("liga com ?pwa=1", () => {
    assert.equal(hasForceQuery("?pwa=1"), true);
    assert.equal(hasForceQuery("pwa=1&x=2"), true);
    assert.equal(hasForceQuery("?debug_pwa=1"), true);
    assert.equal(hasForceQuery("?utm=1"), false);
  });
});

describe("service worker", () => {
  it("não registra em localhost", () => {
    assert.equal(shouldRegisterServiceWorker("localhost"), false);
    assert.equal(shouldRegisterServiceWorker("127.0.0.1"), false);
    assert.equal(shouldRegisterServiceWorker("cdcp.hipercube.ia.br"), true);
  });
});

describe("marca", () => {
  it("usa o nome do treino", () => {
    assert.equal(APP_NAME, "Treino CDCP");
  });
});

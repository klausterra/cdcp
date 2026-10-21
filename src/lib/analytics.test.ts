import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cdcpAnalytics,
  MATOMO_HOST,
  MATOMO_SITE_ID,
  PASS_THRESHOLD,
  PRODUCTION_ANALYTICS_HOSTS,
  sanitizeAnalyticsUrl,
  shouldTrack,
  trackPageView,
} from "./analytics.ts";

type FakeWindow = {
  _paq: unknown[][];
  location: { hostname: string; pathname: string; search: string };
};

function installWindow(hostname: string = PRODUCTION_ANALYTICS_HOSTS[0], search = "") {
  const fake: FakeWindow = {
    _paq: [],
    location: { hostname, pathname: "/", search },
  };
  (globalThis as { window?: FakeWindow }).window = fake;
  (globalThis as { document?: { title: string } }).document = { title: "Treino CDCP" };
  return fake;
}

afterEach(() => {
  delete (globalThis as { window?: FakeWindow }).window;
  delete (globalThis as { document?: { title: string } }).document;
});

describe("Matomo CDCP", () => {
  it("usa o host Hipercube e o site 29", () => {
    assert.equal(MATOMO_HOST, "//matomo.hipercube.ia.br/");
    assert.equal(MATOMO_SITE_ID, "29");
    assert.deepEqual(PRODUCTION_ANALYTICS_HOSTS, ["cdcp.hipercube.ia.br", "cdcp-cnn.pages.dev"]);
    assert.equal(PASS_THRESHOLD, 68);
  });
});

describe("shouldTrack", () => {
  it("liga no domínio canônico e no pages.dev", () => {
    assert.equal(shouldTrack("cdcp.hipercube.ia.br", ""), true);
    assert.equal(shouldTrack("cdcp-cnn.pages.dev", ""), true);
    assert.equal(shouldTrack("localhost", ""), false);
    assert.equal(shouldTrack("127.0.0.1", ""), false);
  });

  it("aceita force em qualquer host", () => {
    assert.equal(shouldTrack("localhost", "?__force_analytics=1"), true);
  });
});

describe("sanitização", () => {
  it("remove query com PII da URL", () => {
    assert.equal(
      sanitizeAnalyticsUrl("/?email=a@b.com&utm_source=instagram&token=secret"),
      "/?utm_source=instagram",
    );
  });
});

describe("helpers Matomo", () => {
  it("não envia pageview fora de produção", () => {
    const win = installWindow("localhost");
    trackPageView();
    assert.deepEqual(win._paq, []);
  });

  it("dispara pageview sanitizada em produção", () => {
    const win = installWindow();
    win.location.search = "?utm_source=instagram&email=a@b.com";
    trackPageView();
    assert.deepEqual(win._paq, [
      ["setCustomUrl", "/?utm_source=instagram"],
      ["setDocumentTitle", "Treino CDCP"],
      ["trackPageView"],
    ]);
  });

  it("marca início e fim de rodada, e meta quando passa", () => {
    const win = installWindow();
    cdcpAnalytics.roundStart("prova");
    cdcpAnalytics.roundComplete("prova", 80);
    assert.deepEqual(win._paq, [
      ["trackEvent", "treino", "round_start", "prova"],
      ["trackEvent", "treino", "round_complete", "prova", 80],
      ["trackEvent", "treino", "round_passed", "prova", 80],
    ]);
  });

  it("não marca round_passed abaixo da referência", () => {
    const win = installWindow();
    cdcpAnalytics.roundComplete("prova", 50);
    assert.deepEqual(win._paq, [["trackEvent", "treino", "round_complete", "prova", 50]]);
  });

  it("rastreia CTA de projeto e rede social", () => {
    const win = installWindow();
    cdcpAnalytics.promoClick("Hipercube");
    cdcpAnalytics.socialClick("instagram");
    assert.deepEqual(win._paq, [
      ["trackEvent", "cta", "promo_click", "Hipercube"],
      ["trackEvent", "cta", "social_click", "instagram"],
    ]);
  });

  it("rastreia o funil do popup PWA", () => {
    const win = installWindow();
    cdcpAnalytics.pwaPromptShown("native");
    cdcpAnalytics.pwaInstallClick("native");
    cdcpAnalytics.pwaDismiss("ios");
    cdcpAnalytics.pwaInstalled();
    assert.deepEqual(win._paq, [
      ["trackEvent", "pwa", "prompt_shown", "native"],
      ["trackEvent", "pwa", "install_click", "native"],
      ["trackEvent", "pwa", "dismiss", "ios"],
      ["trackEvent", "pwa", "installed"],
    ]);
  });
});

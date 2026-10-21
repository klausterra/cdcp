import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { drawRound, QUESTIONS, ROUND_SIZE, type Question } from "@/data/questions";

export const Route = createFileRoute("/")({ component: Home });

type Mode = "prova" | "estudo";

const BEST_KEY = "cdcp-best";

type Attempt = { question: Question; picked: number };

function Home() {
  const [mode, setMode] = useState<Mode>("prova");
  const [deck, setDeck] = useState<Question[]>(() => QUESTIONS.slice(0, ROUND_SIZE));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    setDeck(drawRound());
    const raw = localStorage.getItem(BEST_KEY);
    if (raw) setBest(Number(raw));
  }, []);

  const current = deck[index];
  const progress = done ? 100 : Math.round((index / deck.length) * 100);

  function choose(option: number) {
    if (picked !== null || done) return;
    setPicked(option);
    if (mode === "prova" && option === current.a) setScore((s) => s + 1);
  }

  function next() {
    if (!current || picked === null) return;
    const all = [...attempts, { question: current, picked }];
    setAttempts(all);
    if (index + 1 >= deck.length) {
      if (mode === "prova") {
        const pct = Math.round((score / deck.length) * 100);
        setBest((prev) => {
          const nextBest = prev === null ? pct : Math.max(prev, pct);
          localStorage.setItem(BEST_KEY, String(nextBest));
          return nextBest;
        });
      }
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  function restart(nextMode = mode) {
    setMode(nextMode);
    setDeck(drawRound());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setAttempts([]);
  }

  const pct = Math.round((score / deck.length) * 100);
  const passed = pct >= 68;
  const misses = attempts.filter((item) => item.picked !== item.question.a);

  return (
    <main className="min-h-screen text-fg">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:py-8">
        <header className="overflow-hidden rounded-3xl border border-line bg-bg">
          <img
            src="/og.jpg"
            alt="Treino CDCP, operações de data center"
            className="block h-auto w-full"
          />
          <div className="flex flex-col gap-3 border-t border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-pretty text-muted">
              {QUESTIONS.length} no banco · 40 sorteadas por rodada · referência 68%. Klaus Terra.
            </p>
            <div className="flex w-fit gap-1 rounded-full bg-bg p-1">
              {(["prova", "estudo"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => restart(item)}
                  className={`press min-h-11 rounded-full px-4 text-sm font-medium capitalize ${
                    mode === item ? "bg-primary text-primary-ink" : "text-muted"
                  }`}
                >
                  Modo {item}
                </button>
              ))}
            </div>
          </div>
        </header>

        {!done && current ? (
          <article className="overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="h-1 bg-bg">
              <div className="h-full bg-primary" style={{ width: `${progress}%`, transition: "width 250ms cubic-bezier(0.22, 1, 0.36, 1)" }} />
            </div>
            <div className="grid grid-cols-3 divide-x divide-line border-b border-line font-mono text-xs text-muted">
              <Stat label="Questão" value={done ? String(deck.length) : `${index + 1}/${deck.length}`} />
              <Stat label="Acertos" value={mode === "estudo" ? "—" : String(score)} />
              <Stat label="Melhor" value={best === null ? "—" : `${best}%`} />
            </div>
            <div className="p-4 sm:p-4">
              <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{current.topic}</p>
              <h2 className="mt-2 text-xl leading-snug font-semibold text-balance">{current.q}</h2>
              <div className="mt-4 flex flex-col gap-2">
                {current.opts.map((opt, i) => {
                  const revealed = picked !== null;
                  const correct = i === current.a;
                  const wrongPick = revealed && picked !== -1 && i === picked && !correct;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={revealed}
                      onClick={() => choose(i)}
                      className={`press flex min-h-14 items-center gap-3 rounded-lg border p-1 pr-3 text-left text-sm leading-snug text-pretty disabled:cursor-default ${
                        revealed && correct
                          ? "border-ok bg-ok/10 text-fg"
                          : wrongPick
                            ? "border-bad bg-bad/10 text-fg"
                            : "border-line bg-bg hover:border-primary"
                      }`}
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-sm font-mono text-sm ${
                          revealed && correct
                            ? "bg-ok text-bg"
                            : wrongPick
                              ? "bg-bad text-bg"
                              : "bg-surface text-primary"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(-1)}
                  className={`press min-h-12 rounded-lg border border-dashed px-4 text-left text-sm disabled:cursor-default ${
                    picked === -1 ? "border-warn text-warn" : "border-line text-muted hover:border-primary"
                  }`}
                >
                  Não sei — me ensina
                </button>
              </div>
              {picked !== null && (
                <div key={`${current.id}-${picked}`} className="rise mt-4 rounded-lg border border-line bg-bg p-4 text-sm leading-relaxed text-pretty text-muted">
                  <p className="mb-1 font-medium text-fg">
                    {picked === current.a
                      ? "Correto."
                      : picked === -1
                        ? `Não sabia. A resposta certa é ${String.fromCharCode(65 + current.a)}.`
                        : `Incorreto. A resposta certa é ${String.fromCharCode(65 + current.a)}.`}
                  </p>
                  {current.exp}
                </div>
              )}
              {picked !== null && (
                <button
                  type="button"
                  onClick={next}
                  className="press mt-4 min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-ink"
                >
                  {index + 1 === deck.length ? "Ver resultado" : "Próxima"}
                </button>
              )}
            </div>
          </article>
        ) : (
          <article className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <p className="font-mono text-xs tracking-wide text-primary uppercase">
              {mode === "estudo" ? "Revisão concluída" : passed ? "Acima da referência" : "Abaixo da referência"}
            </p>
            <h2 className="mt-2 text-5xl font-semibold tracking-tight tabular-nums">
              {mode === "estudo" ? misses.length : `${pct}%`}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-pretty text-muted">
              {mode === "estudo"
                ? `${misses.length} questão(ões) para revisar, sorteadas de um banco de ${QUESTIONS.length}.`
                : `${score} de ${deck.length} acertos. A referência é 27 de 40, cerca de 68%.`}
            </p>
            <MissList misses={misses} />
            <button
              type="button"
              onClick={() => restart()}
              className="press mt-5 min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-ink"
            >
              Nova rodada
            </button>
          </article>
        )}

        <Promo />
        <p className="text-xs text-muted">Material de estudo independente. Não é prova oficial EPI/EXIN.</p>
      </div>
    </main>
  );
}

const PROJECTS = [
  {
    name: "Hiperenge",
    href: "https://www.hiperenge.com.br",
    line: "Projetos integrados de engenharia: elétrica, SPDA, climatização, telecom e civil.",
  },
  {
    name: "Hipercube",
    href: "https://www.hipercube.ia.br",
    line: "Software, inteligência artificial e infraestrutura de redes para empresas.",
  },
  {
    name: "Maya Home",
    href: "https://www.mayahome.ia.br",
    line: "Automação residencial com IA: luz, clima, câmeras e sensores num painel só.",
  },
];

function Promo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <aside className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="font-semibold">Klaus Terra</span>
          <span className="text-muted"> · especialista em tecnologias e inteligência artificial</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://instagram.com/klausterra"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-ink"
          >
            @klausterra
          </a>
          <a
            href="https://www.linkedin.com/in/klausterra/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium text-fg"
          >
            LinkedIn
          </a>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-primary/40 bg-surface p-5 sm:p-6">
      <p className="font-mono text-xs tracking-[0.16em] text-primary uppercase">Quem fez este treino</p>
      <h2 className="mt-2 text-2xl font-semibold">Klaus Terra</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Especialista em tecnologias e inteligência artificial. Este quiz é para a turma do CDCP treinar junto — e conhecer o trabalho por trás do instrutor.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PROJECTS.map((project) => (
          <a
            key={project.name}
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line bg-bg-2 p-4 hover:border-primary"
          >
            <p className="font-semibold text-fg">{project.name}</p>
            <p className="mt-1 text-sm leading-snug text-muted">{project.line}</p>
          </a>
        ))}
      </div>
    </aside>
  );
}

function MissList({ misses }: { misses: Attempt[] }) {
  if (misses.length === 0) {
    return <p className="mt-5 text-sm text-ok">Nenhum erro nesta rodada.</p>;
  }
  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">O que revisar · {misses.length}</p>
      {misses.map((item) => (
        <div key={item.question.id} className="rounded-lg border border-line bg-bg p-4 text-sm">
          <p className="font-mono text-xs tracking-wide text-warn uppercase">{item.question.topic}</p>
          <p className="mt-1 font-medium text-pretty text-fg">{item.question.q}</p>
          <p className="mt-2 text-muted">
            Você: {item.picked < 0 ? "Não sei" : item.question.opts[item.picked]}
          </p>
          <p className="text-fg">Certa: {item.question.opts[item.question.a]}</p>
          <p className="mt-2 text-pretty text-muted">{item.question.exp}</p>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3">
      <p className="tracking-[0.14em] uppercase">{label}</p>
      <p className="mt-1 text-lg text-fg tabular-nums">{value}</p>
    </div>
  );
}

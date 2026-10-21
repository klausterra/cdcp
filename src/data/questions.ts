import { MORE } from "./more.ts";

export type Question = {
  id: string;
  topic: string;
  q: string;
  opts: [string, string, string, string];
  a: 0 | 1 | 2 | 3;
  exp: string;
};

const BASE: Question[] = [
  {
    id: "tier3",
    topic: "Padrões",
    q: "Qual classificação do Uptime Institute (ou Rated da TIA-942) exige infraestrutura Concurrently Maintainable?",
    opts: ["Tier I / Rated-1", "Tier II / Rated-2", "Tier III / Rated-3", "Tier IV / Rated-4"],
    a: 2,
    exp: "Tier III / Rated-3 permite retirar qualquer componente para manutenção planejada sem interromper a operação de TI.",
  },
  {
    id: "pue",
    topic: "Energia",
    q: "Qual é a fórmula correta do PUE (Power Usage Effectiveness)?",
    opts: [
      "Energia de TI / Energia total da instalação",
      "Energia total da instalação / Energia de TI",
      "Energia de refrigeração / Energia de TI",
      "(Energia total − Energia de TI) / Energia de TI",
    ],
    a: 1,
    exp: "PUE = energia total ÷ energia dos equipamentos de TI. Quanto mais próximo de 1, melhor a eficiência.",
  },
  {
    id: "srg",
    topic: "Piso e forro",
    q: "Qual condutor é recomendado para aterrar os racks à Signal Reference Grid (SRG)?",
    opts: [
      "Cabo de cobre fino, para reduzir custo",
      "Cabo de cobre com isolamento plástico",
      "Fio de cobre trançado ou fita de cobre plana",
      "Qualquer cabo de cobre, desde que grosso",
    ],
    a: 2,
    exp: "Fio trançado ou fita plana oferece baixa impedância em altas frequências e flexibilidade mecânica.",
  },
  {
    id: "1u",
    topic: "Racks",
    q: "Qual é a altura de 1U (1 RU)?",
    opts: ["19 polegadas", "24 polegadas", "1,75 polegadas (44,45 mm)", "3,5 polegadas"],
    a: 2,
    exp: "1U mede 1,75 polegadas. A largura padrão do rack é 19 polegadas.",
  },
  {
    id: "classd",
    topic: "Incêndio",
    q: "Qual classe de fogo envolve metais combustíveis, como magnésio, sódio e potássio?",
    opts: ["Classe A", "Classe B", "Classe C", "Classe D"],
    a: 3,
    exp: "Classe A: sólidos comuns. B: líquidos inflamáveis. C: equipamentos energizados. D: metais combustíveis.",
  },
  {
    id: "crac",
    topic: "Refrigeração",
    q: "Qual é a principal diferença funcional entre CRAC e CRAH?",
    opts: [
      "CRAC usa água gelada; CRAH usa refrigerante",
      "CRAC usa refrigerante (ciclo DX); CRAH usa água gelada",
      "Os dois usam refrigerante; a CRAH é apenas maior",
      "CRAH só existe em piso elevado",
    ],
    a: 1,
    exp: "CRAC tem compressor e ciclo DX. CRAH não tem compressor e usa serpentina de água gelada de um chiller.",
  },
  {
    id: "sts",
    topic: "Energia",
    q: "Com duas fontes de energia não sincronizadas, o ATS/STS deve ser do tipo:",
    opts: ["Break-before-make", "Make-before-break", "Closed-transition", "Somente estático"],
    a: 0,
    exp: "Break-before-make desconecta a fonte atual antes de ligar a nova, evitando curto entre fontes dessincronizadas.",
  },
  {
    id: "ashrae",
    topic: "Refrigeração",
    q: "Qual é a faixa de temperatura de entrada recomendada pela ASHRAE TC 9.9?",
    opts: ["8–18 °C", "18–27 °C", "20–40 °C", "25–45 °C"],
    a: 1,
    exp: "A faixa recomendada na entrada dos equipamentos de TI é 18–27 °C (64,4–80,6 °F).",
  },
  {
    id: "corridor",
    topic: "Local e edificação",
    q: "Qual é o propósito principal de um service corridor?",
    opts: [
      "Armazenar mídias de backup",
      "Ser o corredor principal de evacuação",
      "Permitir manutenção das áreas de suporte sem perturbar a sala de TI",
      "Abrigar só o sistema de combate a incêndio",
    ],
    a: 2,
    exp: "Dá acesso a UPS, baterias e geradores 24×7 sem interferir na sala de computadores.",
  },
  {
    id: "2n",
    topic: "Energia",
    q: "Qual configuração usa dois sistemas independentes, cada um capaz de 100% da carga de TI?",
    opts: ["N", "N+1", "2N", "N+2"],
    a: 2,
    exp: "2N (system-plus-system) é a base da tolerância a falhas típica de Tier IV.",
  },
  {
    id: "fm200",
    topic: "Incêndio",
    q: "Qual agente é conhecido comercialmente como FM-200?",
    opts: ["HFC-227ea", "FK-5-1-12", "IG-541", "CO₂"],
    a: 0,
    exp: "FM-200 é o nome comercial do HFC-227ea, um clean agent que suprime fogo absorvendo calor.",
  },
  {
    id: "ups",
    topic: "Energia",
    q: "Qual topologia de UPS oferece o maior condicionamento de energia?",
    opts: ["Offline (standby)", "Line-interactive", "Double-conversion (online)", "Ferroresonant"],
    a: 2,
    exp: "Double-conversion online sempre passa a carga pelo retificador-inversor, isolando-a da rede.",
  },
  {
    id: "ohm",
    topic: "Energia",
    q: "Qual é a meta de resistência de aterramento no material de treinamento CDCP?",
    opts: ["Menor que 1 Ω, sem passar de 5 Ω", "Menor que 5 Ω, sem passar de 10 Ω", "Menor que 10 Ω", "Menor que 25 Ω"],
    a: 0,
    exp: "A meta ideal é inferior a 1 Ω e, em nenhuma hipótese, superior a 5 Ω.",
  },
  {
    id: "contain",
    topic: "Refrigeração",
    q: "Ao implantar contenção de corredor em uma sala já existente, o principal cuidado é:",
    opts: [
      "O aumento automático do delta-T",
      "A interferência com o sistema de incêndio existente",
      "A impossibilidade de passar cabeamento",
      "A proibição de racks com porta de vidro",
    ],
    a: 1,
    exp: "A contenção pode bloquear a detecção ou a descarga do sistema de supressão já instalado.",
  },
  {
    id: "ats",
    topic: "Energia",
    q: "Qual é a função principal de um ATS (Automatic Transfer Switch)?",
    opts: [
      "Converter a bateria DC em AC",
      "Transferir a carga entre duas fontes AC, como rede e gerador",
      "Filtrar harmônicos",
      "Sincronizar módulos de UPS",
    ],
    a: 1,
    exp: "O ATS transfere automaticamente a carga entre duas fontes AC independentes.",
  },
  {
    id: "suppress",
    topic: "Incêndio",
    q: "Qual é um objetivo da proteção contra incêndio no data center?",
    opts: ["Informação", "Representação", "Depressão", "Supressão"],
    a: 3,
    exp: "O objetivo é suprimir o fogo antes que cause dano relevante a pessoas, equipamentos ou continuidade.",
  },
  {
    id: "classc",
    topic: "Incêndio",
    q: "Qual classe de fogo envolve equipamentos elétricos energizados?",
    opts: ["Classe A", "Classe B", "Classe C", "Classe K"],
    a: 2,
    exp: "Classe C exige agente não condutivo. Água sobre equipamento energizado cria risco de choque.",
  },
  {
    id: "wave",
    topic: "Energia",
    q: "Qual item é uma anomalia de qualidade de energia AC?",
    opts: ["Signal distortion", "Waveform distortion", "Backup condition", "Attenuation"],
    a: 1,
    exp: "Waveform distortion desvia a forma de onda da senóide ideal, frequentemente por cargas não lineares.",
  },
  {
    id: "fiber",
    topic: "Cabeamento",
    q: "Qual fonte transmite dados em cabo de fibra óptica?",
    opts: ["Sinal elétrico", "Campo magnético", "Luz", "Pulso mecânico"],
    a: 2,
    exp: "A fibra conduz luz, gerada por LED ou laser, conforme o tipo de fibra.",
  },
  {
    id: "crah",
    topic: "Refrigeração",
    q: "Qual equipamento remove calor usando água gelada em circulação, sem compressor próprio?",
    opts: ["CRAC", "CRAH", "STS", "RPP"],
    a: 1,
    exp: "O CRAH é um air handler: ventilador e serpentina de água gelada, sem ciclo de refrigerante próprio.",
  },
  {
    id: "sensible",
    topic: "Refrigeração",
    q: "Que tipo de calor os equipamentos de TI geram principalmente?",
    opts: ["Calor latente", "Calor sensível", "Calor radiante apenas", "Calor de combustão"],
    a: 1,
    exp: "Servidores geram sobretudo calor sensível (aumento de temperatura), com pouca umidade.",
  },
  {
    id: "risk",
    topic: "Operação",
    q: "Qual fórmula define risco no contexto do treinamento?",
    opts: ["Tempo × qualidade", "Segurança × criminalidade", "Impacto × probabilidade", "Probabilidade × custo apenas"],
    a: 2,
    exp: "Risco = impacto × probabilidade. Os dois fatores precisam ser avaliados juntos.",
  },
  {
    id: "mttr",
    topic: "Operação",
    q: "MTTR significa:",
    opts: ["Mean Time To Repair", "Mean Time To Recover only", "Maximum Time To Respond", "Minimum Time To Replace"],
    a: 0,
    exp: "MTTR é o tempo médio para reparar. MTBF é o tempo médio entre falhas.",
  },
  {
    id: "50125",
    topic: "Cabeamento",
    q: "Em uma fibra 50/125 µm, o que os números representam?",
    opts: [
      "Alcance em 10 Gb/s e em 1 Gb/s",
      "Diâmetro do núcleo e da casca, em micrômetros",
      "Atenuação e largura de banda",
      "Distância mínima até cabos de energia",
    ],
    a: 1,
    exp: "O primeiro número é o núcleo; o segundo, a casca. 50/125 µm é fibra multimodo.",
  },
  {
    id: "busbar",
    topic: "Energia",
    q: "Qual é a principal vantagem do busbar trunking em relação à cablagem convencional?",
    opts: ["Custo sempre menor", "Potência fixa e imutável", "Maior flexibilidade de alteração", "Uso exclusivo sob o piso"],
    a: 2,
    exp: "O barramento permite tap-offs e mudanças de circuito com mais flexibilidade do que cabos fixos.",
  },
  {
    id: "clearance",
    topic: "Incêndio",
    q: "Qual é a folga mínima abaixo de sprinklers e bicos de supressão a gás citada no material?",
    opts: ["120 cm", "64 cm", "46 cm", "30 cm"],
    a: 2,
    exp: "A folga mínima usual é 46 cm (18 polegadas), para o agente dispersar sem obstrução.",
  },
  {
    id: "smoke",
    topic: "Incêndio",
    q: "Qual detector é o mais indicado para proteger um data center?",
    opts: ["Somente detector de calor", "Detector de fumaça", "Somente detector de chama", "Nenhum detector automático"],
    a: 1,
    exp: "A fumaça aparece cedo em incêndios de equipamentos e cabos. O detector de fumaça é a escolha principal.",
  },
  {
    id: "strand",
    topic: "Energia",
    q: "O que é stranded power?",
    opts: [
      "Perda joule nos cabos",
      "Energia alocada a um rack e não consumida pelo equipamento instalado",
      "Energia produzida pelo gerador",
      "Reserva da bateria do UPS",
    ],
    a: 1,
    exp: "É capacidade reservada no rack que permanece ociosa, reduzindo a utilização real da instalação.",
  },
  {
    id: "rated4",
    topic: "Padrões",
    q: "Qual Rated da TIA-942 corresponde a uma instalação Fault Tolerant?",
    opts: ["Rated-1", "Rated-2", "Rated-3", "Rated-4"],
    a: 3,
    exp: "Rated-4 é Fault Tolerant, alinhado ao conceito de Tier IV: redundância completa e tolerância a falha.",
  },
  {
    id: "fluo",
    topic: "Iluminação",
    q: "O que considerar na iluminação fluorescente da sala de computadores?",
    opts: [
      "Ligar no mesmo UPS dos equipamentos de TI",
      "Não alimentar pelo mesmo UPS que suporta os equipamentos de TI",
      "Usar somente no corredor de evacuação",
      "Desligar sempre que o gerador partir",
    ],
    a: 1,
    exp: "Reatores fluorescentes não devem compartilhar o UPS da carga de TI, para evitar interferência e carga desnecessária.",
  },
];

export const QUESTIONS: Question[] = [...BASE, ...MORE];

export const ROUND_SIZE = 40;

const QUOTA: [string, number][] = [
  ["Missão crítica", 1],
  ["Padrões", 1],
  ["Local e edificação", 1],
  ["Piso e forro", 3],
  ["Iluminação", 1],
  ["Energia", 6],
  ["EMF", 2],
  ["Racks", 1],
  ["Refrigeração", 4],
  ["Água", 1],
  ["Cabeamento", 2],
  ["Incêndio", 6],
  ["Segurança", 3],
  ["Sistemas auxiliares", 2],
  ["Operação", 6],
];

function shuffle<T>(list: T[]) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function drawRound() {
  const picked: Question[] = [];
  for (const [topic, count] of QUOTA) {
    picked.push(...shuffle(QUESTIONS.filter((item) => item.topic === topic)).slice(0, count));
  }
  if (picked.length < ROUND_SIZE) {
    const ids = new Set(picked.map((item) => item.id));
    picked.push(...shuffle(QUESTIONS.filter((item) => !ids.has(item.id))).slice(0, ROUND_SIZE - picked.length));
  }
  return shuffle(picked);
}

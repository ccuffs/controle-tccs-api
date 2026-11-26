/**
 * Mapa único das etapas do TCC (índices usados em `trabalho_conclusao.etapa`).
 * TCC I (fase 1) usa as etapas 0–5; TCC II (fase 2) usa as etapas 6–8.
 * Os títulos seguem o stepper do discente (TccStepper).
 *
 * Ao clicar em "Finalizar", o stepper grava `etapa = número de etapas da fase`
 * (6 no TCC I, 9 no TCC II): o discente cumpriu todas as etapas e a defesa foi agendada.
 * O seletor de etapa do orientador (obterEtapaMaxima) também oferece esse valor.
 */
export const ETAPAS_TCC: Record<number, string> = {
	0: "Convite para orientador",
	1: "Tema",
	2: "Título",
	3: "Resumo",
	4: "Convite para banca do projeto",
	5: "Agendamento da defesa do projeto",
	6: "Seminário de andamento",
	7: "Convite para banca final",
	8: "Agendamento da defesa final",
};

const FAIXA_POR_FASE: Record<number, { inicio: number; fim: number }> = {
	1: { inicio: 0, fim: 5 },
	2: { inicio: 6, fim: 8 },
};

/** Etapa a partir da qual o discente deve ter enviado os convites de banca da fase. */
export const ETAPA_CONVITE_BANCA: Record<number, number> = { 1: 4, 2: 7 };

/** Etapa gravada pelo "Finalizar" do stepper (6 no TCC I, 9 no TCC II). */
export function etapaFinalizada(fase: number | undefined, etapa: number | null | undefined): boolean {
	if (fase === undefined || etapa === null || etapa === undefined) return false;
	const faixa = FAIXA_POR_FASE[fase];
	return faixa !== undefined && etapa > faixa.fim;
}

export function rotuloEtapa(etapa: number | null | undefined, fase?: number): string {
	if (etapaFinalizada(fase, etapa)) return "Defesa agendada";
	return ETAPAS_TCC[etapa ?? 0] ?? `Etapa ${etapa}`;
}

export function rotuloFase(fase: number): string {
	return fase === 2 ? "TCC (TCC II)" : "Projeto (TCC I)";
}

/**
 * Progresso (0–100) dentro da fase. As etapas da fase mais a etapa finalizada formam a
 * escala; só a aprovação (aprovado_projeto / aprovado_tcc) chega a 100%.
 * Fase 1: etapa 0 → 0%, 5 → 71%, finalizada (6) → 86%. Fase 2: 6 → 0%, 8 → 50%, finalizada (9) → 75%.
 */
export function calcularProgresso(fase: number, etapa: number | null | undefined, aprovado: boolean): number {
	if (aprovado) return 100;
	const faixa = FAIXA_POR_FASE[fase] ?? FAIXA_POR_FASE[1];
	const passos = faixa.fim - faixa.inicio + 2; // etapas da fase + finalizada
	const posicao = Math.min(Math.max((etapa ?? faixa.inicio) - faixa.inicio, 0), passos - 1);
	return Math.round((posicao / passos) * 100);
}

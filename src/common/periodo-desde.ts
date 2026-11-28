import { Op, type WhereOptions } from "sequelize";

/** Período mínimo ("a partir de") vindo de ?desde_ano&desde_semestre. */
export interface PeriodoDesde {
	ano: number;
	semestre: number;
}

/** Converte os parâmetros em período; exige os dois (semestre 1 ou 2), senão não há limite. */
export function periodoDesde(desdeAno?: string | number, desdeSemestre?: string | number): PeriodoDesde | null {
	const ano = Number(desdeAno);
	const semestre = Number(desdeSemestre);
	return Number.isInteger(ano) && ano > 0 && (semestre === 1 || semestre === 2) ? { ano, semestre } : null;
}

/**
 * Condição "período >= desde" sobre as colunas ano/semestre do modelo em que for aplicada
 * (usada pela opção "Todos os períodos" de quem só enxerga a partir de um período).
 */
export function condicaoDesde(desde: PeriodoDesde | null): WhereOptions | null {
	if (!desde) return null;
	return { [Op.or]: [{ ano: { [Op.gt]: desde.ano } }, { ano: desde.ano, semestre: { [Op.gte]: desde.semestre } }] };
}

/** Acrescenta a condição "a partir de" a um where (sem sobrescrever outras condições). */
export function aplicarDesde(where: Record<string | symbol, unknown>, desde: PeriodoDesde | null): void {
	const condicao = condicaoDesde(desde);
	if (!condicao) return;
	const atuais = (where[Op.and] as unknown[] | undefined) ?? [];
	where[Op.and] = [...atuais, condicao];
}

/** O período (ano, semestre) é igual ou posterior a desde? */
export function atendeDesde(periodo: { ano: number; semestre: number }, desde: PeriodoDesde | null): boolean {
	return !desde || periodo.ano > desde.ano || (periodo.ano === desde.ano && periodo.semestre >= desde.semestre);
}

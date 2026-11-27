import { Op, fn, where, type WhereOptions } from "sequelize";

// Letras acentuadas (minúsculas e maiúsculas) e a letra sem acento correspondente, posição a posição.
// O `translate` do PostgreSQL faz a troca sem depender da extensão `unaccent` nem do locale do banco.
const COM_ACENTO = "áàâãäåéèêëíìîïóòôõöúùûüýÿçñÁÀÂÃÄÅÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÝÇÑ";
const SEM_ACENTO = "aaaaaaeeeeiiiiooooouuuuyycnAAAAAAEEEEIIIIOOOOOUUUUYCN";

/** Termo de busca sem acento, em minúsculas e sem espaços nas pontas (mesma regra do front). */
export function normalizarBusca(termo: string): string {
	return termo
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim();
}

/** Escapa os curingas do LIKE (`%`, `_` e `\`) para a busca ser literal. */
function escaparLike(termo: string): string {
	return termo.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Condição "expressão contém o termo", sem diferenciar acentos nem maiúsculas:
 * `lower(translate(expr, 'á…', 'a…')) LIKE '%termo%'`.
 * `expressao` é uma coluna (`col(...)`) ou expressão (`cast(...)`) do Sequelize.
 */
export function contemSemAcento(expressao: unknown, termo: string): WhereOptions {
	const comparavel = fn("lower", fn("translate", expressao, COM_ACENTO, SEM_ACENTO));
	return where(comparavel, { [Op.like]: `%${escaparLike(normalizarBusca(termo))}%` });
}

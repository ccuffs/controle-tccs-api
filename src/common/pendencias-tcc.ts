import { ETAPA_CONVITE_BANCA } from "./etapas-tcc";

export interface PendenciaTcc {
	codigo: "SEM_CONVITE_ORIENTACAO" | "SEM_CONVITE_BANCA" | "CONVITE_BANCA_INCOMPLETO";
	descricao: string;
}

export interface ConvitePendencia {
	codigo_docente: string;
	fase: number;
	orientacao: boolean;
	data_feedback: string | Date | null;
	aceito: boolean;
}

export interface DefesaPendencia {
	membro_banca: string;
	fase: number;
	orientador: boolean;
}

interface DadosPendencia {
	fase: number;
	etapa: number;
	temOrientador: boolean;
	convites: ConvitePendencia[];
	/** Linhas de defesa do TCC (qualquer fase; só as da fase atual contam). */
	defesas: DefesaPendencia[];
}

const recusado = (c: ConvitePendencia) => c.data_feedback !== null && c.data_feedback !== undefined && !c.aceito;

/**
 * Pendências de um TCC, usadas no acompanhamento de orientações e no
 * "Requer atenção" do dashboard:
 * - SEM_CONVITE_ORIENTACAO: sem orientador e sem convite de orientação válido (pendente ou aceito);
 * - SEM_CONVITE_BANCA / CONVITE_BANCA_INCOMPLETO: com orientador, a partir da etapa de convite
 *   da banca da fase, com 0 ou 1 convite de banca válido. Membros já incluídos na defesa contam.
 */
export function calcularPendenciasTcc({ fase, etapa, temOrientador, convites, defesas }: DadosPendencia): PendenciaTcc[] {
	if (!temOrientador) {
		const conviteValido = convites.some((c) => c.orientacao && !recusado(c));
		return conviteValido ? [] : [{ codigo: "SEM_CONVITE_ORIENTACAO", descricao: "Sem convite de orientação" }];
	}

	const etapaConvite = ETAPA_CONVITE_BANCA[fase];
	if (etapaConvite === undefined || etapa < etapaConvite) return [];

	const membros = new Set(
		convites.filter((c) => !c.orientacao && Number(c.fase) === fase && !recusado(c)).map((c) => c.codigo_docente),
	);
	for (const d of defesas) if (Number(d.fase) === fase && !d.orientador) membros.add(d.membro_banca);

	if (membros.size === 0) return [{ codigo: "SEM_CONVITE_BANCA", descricao: "Sem convite de banca" }];
	if (membros.size === 1) return [{ codigo: "CONVITE_BANCA_INCOMPLETO", descricao: "Falta 1 convite de banca" }];
	return [];
}

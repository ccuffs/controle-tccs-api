import { HttpException, Injectable } from "@nestjs/common";
import { calcularProgresso, rotuloEtapa, rotuloFase } from "../common/etapas-tcc";
import { calcularPendenciasTcc } from "../common/pendencias-tcc";
import { Permissoes } from "../permissoes/permissoes.enum";
import { PermissoesService } from "../permissoes/permissoes.service";
import { AcompanhamentoRepository } from "./acompanhamento.repository";
import { FiltrosAcompanhamentoDto } from "./dto/filtros-acompanhamento.dto";
import { aplicarDesde, periodoDesde } from "../common/periodo-desde";

interface DocenteResumo {
	/** id da linha em `orientacao` (para alterar/remover a orientação). */
	id_orientacao: number;
	codigo: string;
	nome: string;
}

interface OrientacaoJson {
	id: number;
	codigo_docente: string;
	orientador: boolean;
	docente?: { codigo?: string; nome?: string | null } | null;
}

interface ConviteJson {
	codigo_docente: string;
	fase: number;
	orientacao: boolean;
	data_feedback: string | Date | null;
	aceito: boolean;
}

interface DefesaJson {
	membro_banca: string;
	fase: number;
	avaliacao: number | null;
	orientador: boolean;
}

interface TccJson {
	id: number;
	ano: number;
	semestre: number;
	id_curso: number;
	fase: number;
	matricula: string;
	tema: string | null;
	titulo: string | null;
	resumo: string | null;
	etapa: number | null;
	aprovado_projeto: boolean;
	aprovado_tcc: boolean;
	dicente?: { matricula?: string; nome?: string; email?: string | null } | null;
	orientacoes?: OrientacaoJson[];
	convites?: ConviteJson[];
	defesas?: DefesaJson[];
}

const LIMITE_PADRAO = 10;
const LIMITE_MAXIMO = 100;

/**
 * Lista de acompanhamento das orientações (tela Orientações do coordenador e
 * Meus orientandos do docente): uma linha por TCC com etapa, progresso, orientador,
 * nota média e pendências calculadas no servidor.
 */
@Injectable()
export class AcompanhamentoService {
	constructor(
		private readonly acompanhamentoRepository: AcompanhamentoRepository,
		private readonly permissoesService: PermissoesService,
	) {}

	async listar(filtros: FiltrosAcompanhamentoDto, idUsuario: string) {
		const codigoDocente = await this.resolverDocente(filtros.codigo_docente, idUsuario);

		const where: Record<string | symbol, unknown> = {};
		if (filtros.id_curso) where.id_curso = parseInt(filtros.id_curso, 10);
		if (filtros.ano) where.ano = parseInt(filtros.ano, 10);
		if (filtros.semestre) where.semestre = parseInt(filtros.semestre, 10);
		aplicarDesde(where, periodoDesde(filtros.desde_ano, filtros.desde_semestre));
		if (filtros.fase) where.fase = parseInt(filtros.fase, 10);

		if (codigoDocente) {
			where.id = await this.acompanhamentoRepository.buscarIdsTccsDoDocente(codigoDocente);
		}

		const pagina = Math.max(parseInt(filtros.pagina || "1", 10) || 1, 1);
		const limite = Math.min(Math.max(parseInt(filtros.limite || String(LIMITE_PADRAO), 10) || LIMITE_PADRAO, 1), LIMITE_MAXIMO);

		const ids = await this.acompanhamentoRepository.buscarIdsOrdenados(where, filtros.q);
		const idsPagina = ids.slice((pagina - 1) * limite, pagina * limite);
		const tccs = await this.acompanhamentoRepository.buscarDetalhes(idsPagina);

		const porId = new Map(tccs.map((t) => [t.id, t]));
		const itens = idsPagina
			.map((id) => porId.get(id))
			.filter((t): t is NonNullable<typeof t> => Boolean(t))
			.map((t) => this.montarItem(t.toJSON() as TccJson));

		return {
			pagina,
			limite,
			total: ids.length,
			total_paginas: Math.max(Math.ceil(ids.length / limite), 1),
			codigo_docente: codigoDocente,
			itens,
		};
	}

	/** Quem não pode ver todas as orientações só enxerga os TCCs do próprio docente. */
	private async resolverDocente(codigoInformado: string | undefined, idUsuario: string): Promise<string | undefined> {
		const permissoes = await this.permissoesService.buscarPermissoesDoUsuario(idUsuario);
		const veTodas = permissoes.some((p) => p.id === Permissoes.ORIENTACAO.VISUALIZAR_TODAS);
		if (veTodas) return codigoInformado || undefined;

		const docente = await this.acompanhamentoRepository.buscarDocentePorUsuario(idUsuario);
		if (!docente) {
			throw new HttpException({ message: "Usuário não está vinculado a um docente" }, 403);
		}
		return docente.codigo;
	}

	private montarItem(t: TccJson) {
		const fase = Number(t.fase);
		const etapa = t.etapa === null || t.etapa === undefined ? 0 : Number(t.etapa);
		const aprovado = fase === 2 ? Boolean(t.aprovado_tcc) : Boolean(t.aprovado_projeto);

		const orientacoes = t.orientacoes || [];
		const paraDocente = (o: OrientacaoJson): DocenteResumo => ({
			id_orientacao: o.id,
			codigo: o.docente?.codigo || o.codigo_docente,
			nome: o.docente?.nome || o.codigo_docente,
		});
		const linhaOrientador = orientacoes.find((o) => o.orientador);
		const orientador = linhaOrientador ? paraDocente(linhaOrientador) : null;
		const coorientadores = orientacoes.filter((o) => !o.orientador).map(paraDocente);

		const defesasFase = (t.defesas || []).filter((d) => Number(d.fase) === fase);
		const notas = defesasFase
			.map((d) => d.avaliacao)
			.filter((n): n is number => n !== null && n !== undefined)
			.map(Number);
		const notaMedia = notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : null;

		return {
			id_tcc: t.id,
			matricula: String(t.dicente?.matricula || t.matricula || ""),
			nome: t.dicente?.nome || "",
			email: t.dicente?.email || null,
			id_curso: t.id_curso,
			ano: t.ano,
			semestre: t.semestre,
			periodo: `${t.ano}/${t.semestre}`,
			fase,
			fase_label: rotuloFase(fase),
			etapa,
			etapa_label: rotuloEtapa(etapa, fase),
			progresso: calcularProgresso(fase, etapa, aprovado),
			aprovado,
			tema: t.tema || null,
			titulo: t.titulo || null,
			resumo: t.resumo || null,
			orientador,
			coorientadores,
			nota_media: notaMedia,
			pendencias: calcularPendenciasTcc({
				fase,
				etapa,
				temOrientador: Boolean(orientador),
				convites: t.convites || [],
				defesas: t.defesas || [],
			}),
		};
	}
}

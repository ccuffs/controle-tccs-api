import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import {
	ConviteEntity,
	CursoEntity,
	DefesaEntity,
	DicenteEntity,
	DocenteEntity,
	OrientacaoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";

export interface FiltrosDeclaracoes {
	ano?: number;
	semestre?: number;
	id_curso?: number;
	fase?: number;
}

export interface DadosDeclaracao {
	id_tcc: number;
	ano: number;
	semestre: number;
	fase: number;
	titulo_tcc: string;
	matricula?: string;
	nome_dicente: string | null;
	nome_docente: string | null;
	siape_docente?: number;
	codigo_docente?: string;
	externo: boolean;
	instituicao?: string | null;
	nome_curso?: string | null;
	nome_coordenador?: string | null;
	siape_coordenador?: number;
	tipo_participacao: "orientacao" | "banca";
	foi_orientador: boolean;
	data_defesa?: Date | null;
}

export interface DadosDeclaracaoTabela {
	nome_docente: string | null;
	siape_docente?: number;
	nome_curso?: string | null;
	nome_coordenador?: string | null;
	siape_coordenador?: number;
	foi_orientador: boolean;
	estudantes: Array<{
		id_tcc: number;
		nome_dicente: string | null;
		titulo_tcc: string;
		fase: number;
		ano: number;
		semestre: number;
		data_defesa: Date | null;
	}>;
}

const DOCENTE_ATTRS = ["codigo", "email", "nome", "sala", "siape", "id_usuario", "externo"];

@Injectable()
export class DeclaracoesRepository {
	constructor(
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
		@InjectModel(ConviteEntity)
		private readonly conviteModel: typeof ConviteEntity,
		@InjectModel(DefesaEntity)
		private readonly defesaModel: typeof DefesaEntity,
	) {}

	/**
	 * Lista declarações individuais apenas para estudantes já avaliados em banca
	 * (`defesa.avaliacao` preenchida), nos papéis de orientador ou membro de banca.
	 */
	async buscarDeclaracoes(idUsuario: string, filtros: FiltrosDeclaracoes): Promise<DadosDeclaracao[]> {
		const { fase, ...filtrosTrabalho } = filtros;

		const defesas = await this.defesaModel.findAll({
			where: {
				avaliacao: { [Op.ne]: null },
				...(fase !== undefined ? { fase } : {}),
			},
			include: [
				{
					model: DocenteEntity,
					as: "membroBanca",
					required: true,
					attributes: DOCENTE_ATTRS,
					where: { id_usuario: idUsuario, externo: false },
				},
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: filtrosTrabalho,
					include: [{ model: DicenteEntity, required: true, attributes: ["nome"] }],
				},
			],
		});

		const declaracoesUnicas: DadosDeclaracao[] = [];
		const chaves = new Set<string>();

		for (const defesa of defesas) {
			const tcc = defesa.trabalhoConclusao!;
			const docente = defesa.membroBanca!;
			const foiOrientador = defesa.orientador;
			const tipoParticipacao = foiOrientador ? "orientacao" : "banca";
			const chave = `${tcc.id}_${tipoParticipacao}_${defesa.fase}`;

			if (chaves.has(chave)) continue;
			chaves.add(chave);

			declaracoesUnicas.push({
				id_tcc: tcc.id,
				ano: tcc.ano,
				semestre: tcc.semestre,
				fase: defesa.fase,
				titulo_tcc: tcc.titulo || "Sem título",
				matricula: tcc.matricula,
				nome_dicente: tcc.dicente!.nome,
				nome_docente: docente.nome,
				siape_docente: docente.siape ?? undefined,
				externo: docente.externo,
				foi_orientador: foiOrientador,
				tipo_participacao: tipoParticipacao,
				data_defesa: defesa.data_defesa,
			});
		}

		return declaracoesUnicas;
	}

	async buscarAnosDisponiveis(idUsuario: string): Promise<number[]> {
		const orientacoes = await this.orientacaoModel.findAll({
			include: [
				{ model: TrabalhoConclusaoEntity, required: true, attributes: ["ano"] },
				{ model: DocenteEntity, required: true, attributes: DOCENTE_ATTRS, where: { id_usuario: idUsuario } },
			],
			where: { orientador: true },
		});

		const bancas = await this.conviteModel.findAll({
			include: [
				{ model: TrabalhoConclusaoEntity, required: true, attributes: ["ano"] },
				{ model: DocenteEntity, required: true, attributes: DOCENTE_ATTRS, where: { id_usuario: idUsuario } },
			],
			where: { aceito: true, orientacao: false },
		});

		const anosSet = new Set<number>();
		orientacoes.forEach((o) => {
			if (o.trabalhoConclusao?.ano) anosSet.add(o.trabalhoConclusao.ano);
		});
		bancas.forEach((c) => {
			if (c.trabalhoConclusao?.ano) anosSet.add(c.trabalhoConclusao.ano);
		});

		return Array.from(anosSet).sort((a, b) => b - a);
	}

	async buscarSemestresDisponiveis(idUsuario: string): Promise<number[]> {
		const orientacoes = await this.orientacaoModel.findAll({
			include: [
				{ model: TrabalhoConclusaoEntity, required: true, attributes: ["semestre"] },
				{ model: DocenteEntity, required: true, attributes: DOCENTE_ATTRS, where: { id_usuario: idUsuario } },
			],
			where: { orientador: true },
		});

		const bancas = await this.conviteModel.findAll({
			include: [
				{ model: TrabalhoConclusaoEntity, required: true, attributes: ["semestre"] },
				{ model: DocenteEntity, required: true, attributes: DOCENTE_ATTRS, where: { id_usuario: idUsuario } },
			],
			where: { aceito: true, orientacao: false },
		});

		const semestresSet = new Set<number>();
		orientacoes.forEach((o) => {
			if (o.trabalhoConclusao?.semestre) semestresSet.add(o.trabalhoConclusao.semestre);
		});
		bancas.forEach((c) => {
			if (c.trabalhoConclusao?.semestre) semestresSet.add(c.trabalhoConclusao.semestre);
		});

		return Array.from(semestresSet).sort((a, b) => a - b);
	}

	async buscarDadosDeclaracao(
		idUsuario: string,
		idTcc: number,
		tipoParticipacao: string,
	): Promise<DadosDeclaracao | null> {
		if (tipoParticipacao !== "orientacao" && tipoParticipacao !== "banca") {
			return null;
		}

		const foiOrientador = tipoParticipacao === "orientacao";

		const defesa = await this.defesaModel.findOne({
			where: {
				id_tcc: idTcc,
				orientador: foiOrientador,
				avaliacao: { [Op.ne]: null },
			},
			include: [
				{
					model: DocenteEntity,
					as: "membroBanca",
					required: true,
					attributes: ["codigo", "nome", "siape", "externo"],
					where: { id_usuario: idUsuario, externo: false },
				},
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: { id: idTcc },
					include: [
						{ model: DicenteEntity, required: true, attributes: ["nome"] },
						{
							model: CursoEntity,
							required: true,
							attributes: ["id", "nome"],
							include: [
								{
									model: DocenteEntity,
									as: "coordenadorDocente",
									required: true,
									attributes: ["nome", "siape"],
								},
							],
						},
					],
				},
			],
			order: [["fase", "DESC"]],
		});

		if (!defesa) return null;

		const tcc = defesa.trabalhoConclusao!;
		const curso = tcc.curso!;
		const docente = defesa.membroBanca!;

		return {
			id_tcc: tcc.id,
			ano: tcc.ano,
			semestre: tcc.semestre,
			fase: defesa.fase,
			titulo_tcc: tcc.titulo || "Sem título",
			nome_dicente: tcc.dicente!.nome,
			nome_docente: docente.nome,
			siape_docente: docente.siape ?? undefined,
			externo: false,
			nome_curso: curso.nome ?? undefined,
			nome_coordenador: curso.coordenadorDocente!.nome ?? undefined,
			siape_coordenador: curso.coordenadorDocente!.siape ?? undefined,
			tipo_participacao: foiOrientador ? "orientacao" : "banca",
			foi_orientador: foiOrientador,
			data_defesa: defesa.data_defesa,
		};
	}

	async buscarDeclaracoesExternas(idUsuarioOrientador: string, filtros: FiltrosDeclaracoes): Promise<DadosDeclaracao[]> {
		const filtrosTrabalho = { ...filtros };

		const orientacoes = await this.orientacaoModel.findAll({
			include: [
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: filtrosTrabalho,
					include: [{ model: DicenteEntity, required: true, attributes: ["nome"] }],
				},
				{ model: DocenteEntity, required: true, where: { id_usuario: idUsuarioOrientador }, attributes: ["codigo"] },
			],
			where: { orientador: true },
		});

		const idTccs = orientacoes.map((o) => o.trabalhoConclusao!.id);

		if (idTccs.length === 0) return [];

		const { fase, ...filtrosTcc } = filtrosTrabalho;

		const defesasExternas = await this.defesaModel.findAll({
			where: {
				id_tcc: idTccs,
				orientador: false,
				avaliacao: { [Op.ne]: null },
				...(fase !== undefined ? { fase } : {}),
			},
			include: [
				{
					model: DocenteEntity,
					as: "membroBanca",
					where: { externo: true },
					required: true,
					attributes: ["codigo", "nome", "siape", "externo", "instituicao"],
				},
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: filtrosTcc,
					include: [{ model: DicenteEntity, required: true, attributes: ["nome"] }],
				},
			],
		});

		return defesasExternas.map((d) => {
			const tcc = d.trabalhoConclusao!;
			const membro = d.membroBanca!;
			return {
				id_tcc: tcc.id,
				ano: tcc.ano,
				semestre: tcc.semestre,
				fase: d.fase,
				titulo_tcc: tcc.titulo || "Sem título",
				matricula: tcc.matricula,
				nome_dicente: tcc.dicente!.nome,
				nome_docente: membro.nome,
				codigo_docente: membro.codigo,
				siape_docente: membro.siape ?? undefined,
				instituicao: membro.instituicao,
				externo: true,
				foi_orientador: false,
				tipo_participacao: "banca",
			};
		});
	}

	/**
	 * Busca defesas avaliadas do docente logado para declaração consolidada em tabela.
	 * Inclui apenas registros com `avaliacao` preenchida (estudante já avaliado em banca).
	 * `foiOrientador=true` → papel de orientador na defesa; `false` → membro de banca.
	 */
	async buscarDadosDeclaracaoTabela(
		idUsuario: string,
		foiOrientador: boolean,
		filtros: FiltrosDeclaracoes,
	): Promise<DadosDeclaracaoTabela | null> {
		const { fase, ...filtrosTrabalho } = filtros;

		const defesas = await this.defesaModel.findAll({
			where: {
				orientador: foiOrientador,
				avaliacao: { [Op.ne]: null },
				...(fase !== undefined ? { fase } : {}),
			},
			include: [
				{
					model: DocenteEntity,
					as: "membroBanca",
					required: true,
					attributes: ["codigo", "nome", "siape", "externo"],
					where: { id_usuario: idUsuario, externo: false },
				},
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: filtrosTrabalho,
					include: [
						{ model: DicenteEntity, required: true, attributes: ["nome"] },
						{
							model: CursoEntity,
							required: true,
							attributes: ["id", "nome"],
							include: [
								{
									model: DocenteEntity,
									as: "coordenadorDocente",
									required: true,
									attributes: ["nome", "siape"],
								},
							],
						},
					],
				},
			],
		});

		if (defesas.length === 0) return null;

		const primeira = defesas[0]!;
		const docente = primeira.membroBanca!;
		const curso = primeira.trabalhoConclusao!.curso!;

		const estudantesUnicos = new Map<string, DadosDeclaracaoTabela["estudantes"][number]>();

		for (const defesa of defesas) {
			const tcc = defesa.trabalhoConclusao!;
			const chave = `${tcc.id}_${defesa.fase}`;
			if (estudantesUnicos.has(chave)) continue;

			estudantesUnicos.set(chave, {
				id_tcc: tcc.id,
				nome_dicente: tcc.dicente!.nome,
				titulo_tcc: tcc.titulo || "Sem título",
				fase: defesa.fase,
				ano: tcc.ano,
				semestre: tcc.semestre,
				data_defesa: defesa.data_defesa,
			});
		}

		const estudantes = Array.from(estudantesUnicos.values()).sort((a, b) =>
			(a.nome_dicente || "").localeCompare(b.nome_dicente || "", "pt-BR", { sensitivity: "base" }),
		);

		return {
			nome_docente: docente.nome,
			siape_docente: docente.siape ?? undefined,
			nome_curso: curso.nome ?? undefined,
			nome_coordenador: curso.coordenadorDocente!.nome ?? undefined,
			siape_coordenador: curso.coordenadorDocente!.siape ?? undefined,
			foi_orientador: foiOrientador,
			estudantes,
		};
	}

	async buscarDadosDeclaracaoExterno(
		idUsuarioOrientador: string,
		idTcc: number,
		codigoDocente: string,
	): Promise<DadosDeclaracao | null> {
		const orientacao = await this.orientacaoModel.findOne({
			include: [{ model: DocenteEntity, required: true, where: { id_usuario: idUsuarioOrientador } }],
			where: { id_tcc: idTcc, orientador: true },
		});

		if (!orientacao) return null;

		const defesa = await this.defesaModel.findOne({
			where: {
				id_tcc: idTcc,
				membro_banca: codigoDocente,
				orientador: false,
				avaliacao: { [Op.ne]: null },
			},
			include: [
				{
					model: DocenteEntity,
					as: "membroBanca",
					where: { externo: true, codigo: codigoDocente },
					required: true,
					attributes: ["codigo", "nome", "siape", "externo", "instituicao"],
				},
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: { id: idTcc },
					include: [
						{ model: DicenteEntity, required: true, attributes: ["nome"] },
						{
							model: CursoEntity,
							required: true,
							attributes: ["id", "nome"],
							include: [
								{ model: DocenteEntity, as: "coordenadorDocente", required: true, attributes: ["nome", "siape"] },
							],
						},
					],
				},
			],
			order: [["fase", "DESC"]],
		});

		if (!defesa) return null;

		const tcc = defesa.trabalhoConclusao!;
		const curso = tcc.curso!;
		const membro = defesa.membroBanca!;

		return {
			id_tcc: tcc.id,
			ano: tcc.ano,
			semestre: tcc.semestre,
			fase: defesa.fase,
			titulo_tcc: tcc.titulo || "Sem título",
			nome_dicente: tcc.dicente!.nome,
			nome_docente: membro.nome,
			siape_docente: membro.siape ?? undefined,
			externo: true,
			instituicao: membro.instituicao,
			nome_curso: curso.nome ?? undefined,
			nome_coordenador: curso.coordenadorDocente!.nome ?? undefined,
			siape_coordenador: curso.coordenadorDocente!.siape ?? undefined,
			tipo_participacao: "banca",
			foi_orientador: false,
			data_defesa: defesa.data_defesa,
		};
	}
}

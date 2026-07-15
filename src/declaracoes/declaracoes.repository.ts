import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
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

	async buscarDeclaracoes(idUsuario: string, filtros: FiltrosDeclaracoes): Promise<DadosDeclaracao[]> {
		const filtrosTrabalho = { ...filtros };

		const orientacoes = await this.orientacaoModel.findAll({
			include: [
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: filtrosTrabalho,
					include: [{ model: DicenteEntity, required: true, attributes: ["nome"] }],
				},
				{
					model: DocenteEntity,
					required: true,
					attributes: DOCENTE_ATTRS,
					where: { id_usuario: idUsuario, externo: false },
				},
			],
			where: { orientador: true },
		});

		const bancas = await this.conviteModel.findAll({
			include: [
				{
					model: TrabalhoConclusaoEntity,
					required: true,
					where: filtrosTrabalho,
					include: [{ model: DicenteEntity, required: true, attributes: ["nome"] }],
				},
				{
					model: DocenteEntity,
					required: true,
					attributes: DOCENTE_ATTRS,
					where: { id_usuario: idUsuario, externo: false },
				},
			],
			where: { aceito: true, orientacao: false },
		});

		const declaracoesOrientacao: DadosDeclaracao[] = orientacoes.map((orientacao) => {
			const tcc = orientacao.trabalhoConclusao!;
			const docente = orientacao.docente!;
			return {
				id_tcc: tcc.id,
				ano: tcc.ano,
				semestre: tcc.semestre,
				fase: tcc.fase,
				titulo_tcc: tcc.titulo || "Sem título",
				matricula: tcc.matricula,
				nome_dicente: tcc.dicente!.nome,
				nome_docente: docente.nome,
				siape_docente: docente.siape ?? undefined,
				externo: docente.externo,
				foi_orientador: true,
				tipo_participacao: "orientacao",
			};
		});

		const declaracoesBanca: DadosDeclaracao[] = bancas.map((convite) => {
			const tcc = convite.trabalhoConclusao!;
			const docente = convite.docente!;
			return {
				id_tcc: tcc.id,
				ano: tcc.ano,
				semestre: tcc.semestre,
				fase: tcc.fase,
				titulo_tcc: tcc.titulo || "Sem título",
				matricula: tcc.matricula,
				nome_dicente: tcc.dicente!.nome,
				nome_docente: docente.nome,
				siape_docente: docente.siape ?? undefined,
				externo: docente.externo,
				foi_orientador: false,
				tipo_participacao: "banca",
			};
		});

		const declaracoes = [...declaracoesOrientacao, ...declaracoesBanca];
		const declaracoesUnicas: DadosDeclaracao[] = [];
		const chaves = new Set<string>();

		for (const decl of declaracoes) {
			const chave = `${decl.id_tcc}_${decl.tipo_participacao}`;
			if (!chaves.has(chave)) {
				chaves.add(chave);
				declaracoesUnicas.push(decl);
			}
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
		if (tipoParticipacao === "orientacao") {
			const orientacao = await this.orientacaoModel.findOne({
				include: [
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
					{ model: DocenteEntity, required: true, attributes: ["nome", "siape"], where: { id_usuario: idUsuario } },
				],
				where: { orientador: true },
			});

			if (!orientacao) return null;

			const tcc = orientacao.trabalhoConclusao!;
			const curso = tcc.curso!;
			return {
				id_tcc: tcc.id,
				ano: tcc.ano,
				semestre: tcc.semestre,
				fase: tcc.fase,
				titulo_tcc: tcc.titulo || "Sem título",
				nome_dicente: tcc.dicente!.nome,
				nome_docente: orientacao.docente!.nome,
				siape_docente: orientacao.docente!.siape ?? undefined,
				externo: false,
				nome_curso: curso.nome ?? undefined,
				nome_coordenador: curso.coordenadorDocente!.nome ?? undefined,
				siape_coordenador: curso.coordenadorDocente!.siape ?? undefined,
				tipo_participacao: "orientacao",
				foi_orientador: true,
			};
		}

		if (tipoParticipacao === "banca") {
			const convite = await this.conviteModel.findOne({
				include: [
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
					{
						model: DocenteEntity,
						required: true,
						attributes: ["nome", "siape", "codigo"],
						where: { id_usuario: idUsuario },
					},
				],
				where: { aceito: true, orientacao: false },
			});

			if (!convite) return null;

			const tcc = convite.trabalhoConclusao!;
			const curso = tcc.curso!;
			const docente = convite.docente!;

			const defesa = await this.defesaModel.findOne({
				where: { id_tcc: idTcc, membro_banca: docente.codigo, fase: tcc.fase },
				attributes: ["data_defesa"],
			});

			return {
				id_tcc: tcc.id,
				ano: tcc.ano,
				semestre: tcc.semestre,
				fase: tcc.fase,
				titulo_tcc: tcc.titulo || "Sem título",
				nome_dicente: tcc.dicente!.nome,
				nome_docente: docente.nome,
				siape_docente: docente.siape ?? undefined,
				externo: false,
				nome_curso: curso.nome ?? undefined,
				nome_coordenador: curso.coordenadorDocente!.nome ?? undefined,
				siape_coordenador: curso.coordenadorDocente!.siape ?? undefined,
				tipo_participacao: "banca",
				foi_orientador: false,
				data_defesa: defesa?.data_defesa,
			};
		}

		return null;
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

		const defesasExternas = await this.defesaModel.findAll({
			where: { id_tcc: idTccs, orientador: false },
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
					where: filtrosTrabalho,
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
			where: { id_tcc: idTcc, membro_banca: codigoDocente, orientador: false },
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
		});

		if (!defesa) return null;

		const tcc = defesa.trabalhoConclusao!;
		const curso = tcc.curso!;
		const membro = defesa.membroBanca!;

		return {
			id_tcc: tcc.id,
			ano: tcc.ano,
			semestre: tcc.semestre,
			fase: tcc.fase,
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

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, WhereOptions, cast, col, where as sqlWhere } from "sequelize";
import {
	ConviteEntity,
	DefesaEntity,
	DicenteEntity,
	DocenteEntity,
	OrientacaoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";

@Injectable()
export class AcompanhamentoRepository {
	constructor(
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
		@InjectModel(DocenteEntity)
		private readonly docenteModel: typeof DocenteEntity,
	) {}

	buscarDocentePorUsuario(idUsuario: string): Promise<DocenteEntity | null> {
		return this.docenteModel.findOne({ attributes: ["codigo"], where: { id_usuario: idUsuario } });
	}

	async buscarIdsTccsDoDocente(codigoDocente: string): Promise<number[]> {
		const linhas = (await this.orientacaoModel.findAll({
			attributes: ["id_tcc"],
			where: { codigo_docente: codigoDocente },
			raw: true,
		})) as unknown as { id_tcc: number }[];
		return [...new Set(linhas.map((l) => l.id_tcc))];
	}

	/**
	 * IDs dos TCCs que atendem aos filtros, já ordenados (período mais recente primeiro,
	 * depois nome do discente). A paginação é feita sobre esta lista.
	 */
	async buscarIdsOrdenados(where: WhereOptions, busca?: string): Promise<number[]> {
		// Escapa curingas do LIKE para que a busca seja literal.
		const termo = busca?.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
		const whereBusca = termo
			? {
					[Op.and]: [
						where,
						{
							[Op.or]: [
								// matrícula é bigint no banco: compara como texto para permitir busca parcial
								sqlWhere(cast(col("TrabalhoConclusao.matricula"), "text"), { [Op.iLike]: `%${termo}%` }),
								{ "$dicente.nome$": { [Op.iLike]: `%${termo}%` } },
								{ "$orientacoes.docente.nome$": { [Op.iLike]: `%${termo}%` } },
							],
						},
					],
				}
			: where;

		const linhas = (await this.trabalhoConclusaoModel.findAll({
			attributes: ["id", "ano", "semestre"],
			where: whereBusca,
			include: [
				{ model: DicenteEntity, attributes: ["nome"], required: false },
				{
					model: OrientacaoEntity,
					attributes: [],
					required: false,
					where: { orientador: true },
					include: [{ model: DocenteEntity, attributes: [], required: false }],
				},
			],
			order: [
				["ano", "DESC"],
				["semestre", "DESC"],
				[{ model: DicenteEntity, as: "dicente" }, "nome", "ASC"],
				["id", "ASC"],
			],
			subQuery: false,
			raw: true,
		})) as unknown as { id: number }[];

		// Um TCC pode repetir se tiver mais de uma linha de orientador; mantém a primeira ocorrência.
		return [...new Set(linhas.map((l) => l.id))];
	}

	buscarDetalhes(ids: number[]): Promise<TrabalhoConclusaoEntity[]> {
		if (ids.length === 0) return Promise.resolve([]);
		return this.trabalhoConclusaoModel.findAll({
			attributes: [
				"id",
				"ano",
				"semestre",
				"id_curso",
				"fase",
				"matricula",
				"tema",
				"titulo",
				"resumo",
				"etapa",
				"aprovado_projeto",
				"aprovado_tcc",
			],
			where: { id: { [Op.in]: ids } },
			include: [
				{ model: DicenteEntity, attributes: ["matricula", "nome", "email"], required: false },
				{
					model: OrientacaoEntity,
					attributes: ["id", "codigo_docente", "orientador"],
					required: false,
					separate: true,
					include: [{ model: DocenteEntity, attributes: ["codigo", "nome"] }],
				},
				{
					model: ConviteEntity,
					attributes: ["codigo_docente", "fase", "orientacao", "data_envio", "data_feedback", "aceito"],
					required: false,
					separate: true,
				},
				{
					model: DefesaEntity,
					attributes: ["membro_banca", "fase", "avaliacao", "orientador"],
					required: false,
					separate: true,
				},
			],
		});
	}
}

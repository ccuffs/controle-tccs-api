import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, Transaction } from "sequelize";
import { CursoEntity, DicenteEntity, DocenteEntity, OrientacaoEntity, TrabalhoConclusaoEntity } from "../database/entities";

export interface FiltrosOrientacoes {
	id_tcc?: string;
	codigo_docente?: string;
	orientador?: string;
}

const TCC_ATTRS = [
	"id",
	"ano",
	"semestre",
	"fase",
	"matricula",
	"tema",
	"titulo",
	"resumo",
	"etapa",
	"aprovado_projeto",
	"aprovado_tcc",
	"comentarios_tcc",
];

@Injectable()
export class OrientacoesRepository {
	constructor(
		@InjectModel(OrientacaoEntity)
		private readonly orientacaoModel: typeof OrientacaoEntity,
	) {}

	async obterTodasOrientacoes(filtros: FiltrosOrientacoes): Promise<OrientacaoEntity[]> {
		const { id_tcc, codigo_docente, orientador } = filtros;
		const whereClause: Record<string, unknown> = {};

		if (id_tcc) whereClause.id_tcc = parseInt(id_tcc, 10);
		if (codigo_docente) whereClause.codigo_docente = codigo_docente;
		if (orientador !== undefined) whereClause.orientador = orientador === "true";

		return this.orientacaoModel.findAll({
			where: whereClause,
			include: [
				{ model: DocenteEntity, attributes: ["codigo", "nome", "email", "siape"] },
				{
					model: TrabalhoConclusaoEntity,
					attributes: TCC_ATTRS,
					include: [
						{ model: DicenteEntity, attributes: ["matricula", "nome", "email"] },
						{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
					],
				},
			],
			order: [["id", "DESC"]],
		});
	}

	async obterOrientacoesPorTcc(idTcc: number): Promise<OrientacaoEntity[]> {
		return this.orientacaoModel.findAll({
			where: { id_tcc: idTcc },
			include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email"] }],
			order: [
				["orientador", "DESC"],
				["id", "ASC"],
			],
		});
	}

	async verificarOrientacaoExiste(codigoDocente: string, idTcc: number, transaction: Transaction | null = null): Promise<boolean> {
		const orientacao = await this.orientacaoModel.findOne({
			where: { codigo_docente: codigoDocente, id_tcc: idTcc },
			transaction: transaction ?? undefined,
		});
		return orientacao !== null;
	}

	async verificarOrientadorExiste(idTcc: number, transaction: Transaction | null = null): Promise<boolean> {
		const orientador = await this.orientacaoModel.findOne({
			where: { id_tcc: idTcc, orientador: true },
			transaction: transaction ?? undefined,
		});
		return orientador !== null;
	}

	async obterOrientacaoPorId(id: number): Promise<OrientacaoEntity | null> {
		return this.orientacaoModel.findByPk(id);
	}

	async verificarOutroOrientadorExiste(idTcc: number, idExcluir: number): Promise<boolean> {
		const orientador = await this.orientacaoModel.findOne({
			where: { id_tcc: idTcc, orientador: true, id: { [Op.ne]: idExcluir } },
		});
		return orientador !== null;
	}

	async criarOrientacao(dadosOrientacao: Partial<OrientacaoEntity>, transaction: Transaction | null = null): Promise<OrientacaoEntity> {
		const orientacao = this.orientacaoModel.build(dadosOrientacao);
		await orientacao.save({ transaction: transaction ?? undefined });
		return orientacao;
	}

	async atualizarOrientacao(id: number, dadosOrientacao: Partial<OrientacaoEntity>): Promise<boolean> {
		const [linhasAfetadas] = await this.orientacaoModel.update(dadosOrientacao, { where: { id } });
		return linhasAfetadas > 0;
	}

	async deletarOrientacao(id: number): Promise<boolean> {
		const deleted = await this.orientacaoModel.destroy({ where: { id } });
		return deleted > 0;
	}
}

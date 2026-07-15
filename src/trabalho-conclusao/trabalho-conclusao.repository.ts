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

export interface FiltrosTrabalhoConclusao {
	ano?: string;
	semestre?: string;
	id_curso?: string;
	fase?: string;
	matricula?: string;
	etapa?: string;
}

const includeDicenteCurso = [
	{ model: DicenteEntity, attributes: ["matricula", "nome", "email"] },
	{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
];

@Injectable()
export class TrabalhoConclusaoRepository {
	constructor(
		@InjectModel(TrabalhoConclusaoEntity)
		private readonly trabalhoConclusaoModel: typeof TrabalhoConclusaoEntity,
	) {}

	async obterTodosTrabalhosConclusao(filtros: FiltrosTrabalhoConclusao): Promise<TrabalhoConclusaoEntity[]> {
		const { ano, semestre, id_curso, fase, matricula, etapa } = filtros;
		const whereClause: Record<string, number> = {};

		if (ano) whereClause.ano = parseInt(ano, 10);
		if (semestre) whereClause.semestre = parseInt(semestre, 10);
		if (id_curso) whereClause.id_curso = parseInt(id_curso, 10);
		if (fase) whereClause.fase = parseInt(fase, 10);
		if (matricula) whereClause.matricula = parseInt(matricula, 10);
		if (etapa) whereClause.etapa = parseInt(etapa, 10);

		return this.trabalhoConclusaoModel.findAll({
			where: whereClause,
			include: [
				...includeDicenteCurso,
				{
					model: OrientacaoEntity,
					include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email"] }],
				},
				{
					model: DefesaEntity,
					required: false,
					include: [{ model: DocenteEntity, as: "membroBanca", attributes: ["codigo", "nome", "email"] }],
				},
			],
			order: [
				["ano", "DESC"],
				["semestre", "DESC"],
				["id", "DESC"],
			],
		});
	}

	async obterTrabalhoConclusaoPorId(id: number): Promise<TrabalhoConclusaoEntity | null> {
		return this.trabalhoConclusaoModel.findByPk(id, {
			include: [
				...includeDicenteCurso,
				{
					model: OrientacaoEntity,
					include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email"] }],
				},
				{ model: ConviteEntity },
				{
					model: DefesaEntity,
					include: [{ model: DocenteEntity, as: "membroBanca", attributes: ["codigo", "nome", "email"] }],
				},
			],
		});
	}

	async buscarPorDiscente(matricula: string): Promise<TrabalhoConclusaoEntity | null> {
		return this.trabalhoConclusaoModel.findOne({
			where: { matricula: parseInt(matricula, 10) },
			include: includeDicenteCurso,
			order: [
				["ano", "DESC"],
				["semestre", "DESC"],
				["fase", "ASC"],
				["id", "DESC"],
			],
		});
	}

	async buscarPorDiscenteEOferta(
		matricula: string,
		ano: number,
		semestre: number,
		idCurso: number,
		fase: number,
	): Promise<TrabalhoConclusaoEntity | null> {
		return this.trabalhoConclusaoModel.findOne({
			where: {
				matricula: parseInt(matricula, 10),
				ano,
				semestre,
				id_curso: idCurso,
				fase,
			},
			include: includeDicenteCurso,
		});
	}

	async criarTrabalhoConclusao(dadosTrabalho: Partial<TrabalhoConclusaoEntity>): Promise<TrabalhoConclusaoEntity> {
		const trabalho = this.trabalhoConclusaoModel.build(dadosTrabalho);
		await trabalho.save();
		return trabalho;
	}

	async atualizarTrabalhoConclusao(id: number, dadosTrabalho: Partial<TrabalhoConclusaoEntity>): Promise<boolean> {
		const [linhasAfetadas] = await this.trabalhoConclusaoModel.update(dadosTrabalho, { where: { id } });
		return linhasAfetadas > 0;
	}

	async atualizarEtapaTrabalho(id: number, etapa: number): Promise<boolean> {
		const [linhasAfetadas] = await this.trabalhoConclusaoModel.update({ etapa }, { where: { id } });
		return linhasAfetadas > 0;
	}

	async deletarTrabalhoConclusao(id: number): Promise<boolean> {
		const deleted = await this.trabalhoConclusaoModel.destroy({ where: { id } });
		return deleted > 0;
	}
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import {
	CursoEntity,
	DefesaEntity,
	DicenteEntity,
	DocenteEntity,
	OrientacaoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";

export interface FiltrosTcc {
	ano?: string | number;
	semestre?: string | number;
	fase?: string | number;
	id_curso?: string | number;
	etapa?: string | number;
}

@Injectable()
export class DicentesRepository {
	constructor(
		@InjectModel(DicenteEntity)
		private readonly dicenteModel: typeof DicenteEntity,
	) {}

	async obterTodosDicentes(): Promise<DicenteEntity[]> {
		return this.dicenteModel.findAll({ order: [["nome", "ASC"]] });
	}

	async obterDicentesComFiltrosTcc(filtros: FiltrosTcc): Promise<DicenteEntity[]> {
		const { ano, semestre, fase, id_curso, etapa } = filtros;
		const trabalhoWhere: Record<string, number> = {};

		if (ano) trabalhoWhere.ano = parseInt(String(ano), 10);
		if (semestre) trabalhoWhere.semestre = parseInt(String(semestre), 10);
		if (fase) trabalhoWhere.fase = parseInt(String(fase), 10);
		if (id_curso) trabalhoWhere.id_curso = parseInt(String(id_curso), 10);
		if (etapa) trabalhoWhere.etapa = parseInt(String(etapa), 10);

		return this.dicenteModel.findAll({
			include: [
				{
					model: TrabalhoConclusaoEntity,
					where: trabalhoWhere,
					required: true,
					include: [{ model: CursoEntity, attributes: ["id", "nome", "codigo"] }],
				},
			],
			order: [["nome", "ASC"]],
		});
	}

	async obterDicentePorMatricula(matricula: string): Promise<DicenteEntity | null> {
		return this.dicenteModel.findByPk(matricula, {
			include: [
				{
					model: TrabalhoConclusaoEntity,
					include: [
						{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
						{
							model: OrientacaoEntity,
							include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email", "siape"] }],
						},
						{ model: DefesaEntity, required: false },
					],
				},
			],
		});
	}

	async obterDicentePorUsuario(idUsuario: string): Promise<DicenteEntity | null> {
		return this.dicenteModel.findOne({
			where: { id_usuario: idUsuario },
			include: [
				{
					model: TrabalhoConclusaoEntity,
					include: [
						{ model: CursoEntity, attributes: ["id", "nome", "codigo"] },
						{
							model: OrientacaoEntity,
							include: [{ model: DocenteEntity, attributes: ["codigo", "nome", "email", "siape"] }],
						},
						{ model: DefesaEntity, required: false },
					],
				},
			],
		});
	}

	async verificarDicenteExiste(matricula: string): Promise<boolean> {
		const dicente = await this.dicenteModel.findByPk(matricula);
		return dicente !== null;
	}

	async criarDicente(dadosDicente: Partial<DicenteEntity>): Promise<DicenteEntity> {
		const dicente = this.dicenteModel.build(dadosDicente);
		await dicente.save();
		return dicente;
	}

	async atualizarDicente(matricula: string, dadosDicente: Partial<DicenteEntity>): Promise<boolean> {
		const [linhasAfetadas] = await this.dicenteModel.update(dadosDicente, { where: { matricula } });
		return linhasAfetadas > 0;
	}

	async deletarDicente(matricula: string): Promise<boolean> {
		const deleted = await this.dicenteModel.destroy({ where: { matricula } });
		return deleted > 0;
	}
}

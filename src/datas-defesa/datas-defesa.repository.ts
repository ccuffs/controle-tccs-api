import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CursoEntity, DatasDefesaTccEntity } from "../database/entities";

export interface FiltrosDatasDefesa {
	ano?: string;
	semestre?: string;
	id_curso?: string;
	fase?: string;
}

const includeCurso = [{ model: CursoEntity, attributes: ["id", "nome", "codigo"] }];

@Injectable()
export class DatasDefesaRepository {
	constructor(
		@InjectModel(DatasDefesaTccEntity)
		private readonly datasDefesaModel: typeof DatasDefesaTccEntity,
	) {}

	async obterTodasDatasDefesa(filtros: FiltrosDatasDefesa): Promise<DatasDefesaTccEntity[]> {
		const { ano, semestre, id_curso, fase } = filtros;
		const whereClause: Record<string, number> = {};

		if (ano) whereClause.ano = parseInt(ano, 10);
		if (semestre) whereClause.semestre = parseInt(semestre, 10);
		if (id_curso) whereClause.id_curso = parseInt(id_curso, 10);
		if (fase) whereClause.fase = parseInt(fase, 10);

		return this.datasDefesaModel.findAll({
			where: whereClause,
			include: includeCurso,
			order: [
				["ano", "DESC"],
				["semestre", "DESC"],
				["fase", "ASC"],
			],
		});
	}

	async obterDatasDefesaPorOferta(
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
	): Promise<DatasDefesaTccEntity | null> {
		return this.datasDefesaModel.findOne({
			where: {
				ano: parseInt(ano, 10),
				semestre: parseInt(semestre, 10),
				id_curso: parseInt(idCurso, 10),
				fase: parseInt(fase, 10),
			},
			include: includeCurso,
		});
	}

	async criarDataDefesa(dados: Partial<DatasDefesaTccEntity>): Promise<DatasDefesaTccEntity> {
		const dataDefesa = this.datasDefesaModel.build(dados);
		await dataDefesa.save();
		return dataDefesa;
	}

	async atualizarDataDefesa(
		ano: string,
		semestre: string,
		idCurso: string,
		fase: string,
		dados: Partial<DatasDefesaTccEntity>,
	): Promise<boolean> {
		const [linhasAfetadas] = await this.datasDefesaModel.update(dados, {
			where: {
				ano: parseInt(ano, 10),
				semestre: parseInt(semestre, 10),
				id_curso: parseInt(idCurso, 10),
				fase: parseInt(fase, 10),
			},
		});
		return linhasAfetadas > 0;
	}

	async deletarDataDefesa(ano: string, semestre: string, idCurso: string, fase: string): Promise<boolean> {
		const deleted = await this.datasDefesaModel.destroy({
			where: {
				ano: parseInt(ano, 10),
				semestre: parseInt(semestre, 10),
				id_curso: parseInt(idCurso, 10),
				fase: parseInt(fase, 10),
			},
		});
		return deleted > 0;
	}
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BancaCursoEntity, CursoEntity, DocenteEntity } from "../database/entities";

@Injectable()
export class BancaCursoRepository {
	constructor(
		@InjectModel(BancaCursoEntity)
		private readonly bancaCursoModel: typeof BancaCursoEntity,
	) {}

	async obterDocentesBancaPorCurso(idCurso: number): Promise<BancaCursoEntity[]> {
		return this.bancaCursoModel.findAll({
			where: { id_curso: idCurso },
			include: [{ model: DocenteEntity, as: "docente", attributes: ["codigo", "nome", "email"] }],
			order: [[{ model: DocenteEntity, as: "docente" }, "nome", "ASC"]],
		});
	}

	async obterCursosPorDocenteBanca(codigoDocente: string): Promise<BancaCursoEntity[]> {
		return this.bancaCursoModel.findAll({
			where: { codigo_docente: codigoDocente },
			include: [{ model: CursoEntity, as: "curso", attributes: ["id", "nome", "codigo", "turno"] }],
			order: [[{ model: CursoEntity, as: "curso" }, "nome", "ASC"]],
		});
	}

	async verificarDocenteBanca(idCurso: number, codigoDocente: string): Promise<boolean> {
		const bancaCurso = await this.bancaCursoModel.findOne({
			where: { id_curso: idCurso, codigo_docente: codigoDocente },
		});
		return !!bancaCurso;
	}
}

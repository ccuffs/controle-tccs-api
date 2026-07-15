import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CursoEntity, DocenteEntity, OrientadorCursoEntity } from "../database/entities";

@Injectable()
export class OrientadoresRepository {
	constructor(
		@InjectModel(OrientadorCursoEntity)
		private readonly orientadorCursoModel: typeof OrientadorCursoEntity,
	) {}

	async obterTodasOrientacoes(): Promise<OrientadorCursoEntity[]> {
		return this.orientadorCursoModel.findAll({
			include: [
				{ model: DocenteEntity, as: "docente", attributes: ["codigo", "nome", "email", "siape"] },
				{ model: CursoEntity, as: "curso", attributes: ["id", "nome", "codigo", "turno"] },
			],
			order: [[{ model: DocenteEntity, as: "docente" }, "nome", "ASC"]],
		});
	}

	async obterOrientacoesPorDocente(codigoDocente: string): Promise<OrientadorCursoEntity[]> {
		return this.orientadorCursoModel.findAll({
			where: { codigo_docente: codigoDocente },
			include: [{ model: CursoEntity, as: "curso", attributes: ["id", "nome", "codigo", "turno"] }],
			order: [[{ model: CursoEntity, as: "curso" }, "nome", "ASC"]],
		});
	}

	async obterOrientacoesPorCurso(idCurso: number): Promise<OrientadorCursoEntity[]> {
		return this.orientadorCursoModel.findAll({
			where: { id_curso: idCurso },
			include: [{ model: DocenteEntity, as: "docente", attributes: ["codigo", "nome", "email", "siape"] }],
			order: [[{ model: DocenteEntity, as: "docente" }, "nome", "ASC"]],
		});
	}

	async criarOrientacao(dados: Partial<OrientadorCursoEntity>): Promise<OrientadorCursoEntity> {
		const orientacao = this.orientadorCursoModel.build(dados);
		await orientacao.save();
		return orientacao;
	}

	async deletarOrientacao(idCurso: number, codigoDocente: string): Promise<boolean> {
		const deleted = await this.orientadorCursoModel.destroy({
			where: { id_curso: idCurso, codigo_docente: codigoDocente },
		});
		return deleted > 0;
	}
}

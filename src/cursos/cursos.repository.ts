import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CursoEntity } from "../database/entities";

@Injectable()
export class CursosRepository {
	constructor(
		@InjectModel(CursoEntity)
		private readonly cursoModel: typeof CursoEntity,
	) {}

	async obterTodosCursos(): Promise<CursoEntity[]> {
		return this.cursoModel.findAll();
	}

	async obterCursoPorId(id: number): Promise<CursoEntity | null> {
		return this.cursoModel.findByPk(id);
	}

	async criarCurso(dadosCurso: Partial<CursoEntity>): Promise<CursoEntity> {
		const curso = this.cursoModel.build(dadosCurso);
		await curso.save();
		return curso;
	}

	async atualizarCurso(id: number, dadosCurso: Partial<CursoEntity>): Promise<boolean> {
		const [linhasAfetadas] = await this.cursoModel.update(dadosCurso, { where: { id } });
		return linhasAfetadas > 0;
	}

	async deletarCurso(id: number): Promise<boolean> {
		const deleted = await this.cursoModel.destroy({ where: { id } });
		return deleted > 0;
	}
}

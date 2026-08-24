import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CursoEntity, GrupoEntity, UsuarioEntity } from "../database/entities";

@Injectable()
export class AuthRepository {
	constructor(
		@InjectModel(UsuarioEntity)
		private readonly usuarioModel: typeof UsuarioEntity,
	) {}

	async buscarUsuarioPorEmail(email: string): Promise<UsuarioEntity | null> {
		return this.usuarioModel.findOne({
			where: { email },
			include: [{ model: GrupoEntity, as: "grupos", through: { attributes: [] } }],
		});
	}

	async buscarUsuarioPorId(userId: string): Promise<UsuarioEntity | null> {
		return this.usuarioModel.findByPk(userId, {
			include: [
				{ model: GrupoEntity, as: "grupos", through: { attributes: [] } },
				{ model: CursoEntity, as: "cursos", through: { attributes: [] } },
			],
		});
	}

	async buscarUsuarioPorIdSimples(userId: string): Promise<UsuarioEntity | null> {
		return this.usuarioModel.findByPk(userId);
	}
}

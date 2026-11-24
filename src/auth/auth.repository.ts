import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CursoEntity, DocenteEntity, GrupoEntity, UsuarioEntity } from "../database/entities";

@Injectable()
export class AuthRepository {
	constructor(
		@InjectModel(UsuarioEntity)
		private readonly usuarioModel: typeof UsuarioEntity,
		@InjectModel(DocenteEntity)
		private readonly docenteModel: typeof DocenteEntity,
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

	/**
	 * Vincula o registro do docente ao usuário autenticado caso `id_usuario`
	 * ainda seja nulo. Executado de forma silenciosa no login (lazy binding):
	 * evita que docentes que nunca tiveram `id_usuario` preenchido recebam
	 * "Docente não encontrado para este usuário" ao tentar acessar os convites.
	 */
	async vincularDocenteAoUsuario(email: string, idUsuario: string): Promise<void> {
		try {
			await this.docenteModel.update(
				{ id_usuario: idUsuario },
				{ where: { email, id_usuario: null } },
			);
		} catch {
			// Silencioso: não bloqueia o login se a vinculação falhar.
		}
	}
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { GrupoEntity, PermissaoEntity, UsuarioEntity } from "../database/entities";

@Injectable()
export class PermissoesRepository {
	constructor(
		@InjectModel(UsuarioEntity)
		private readonly usuarioModel: typeof UsuarioEntity,
		@InjectModel(PermissaoEntity)
		private readonly permissaoModel: typeof PermissaoEntity,
		@InjectModel(GrupoEntity)
		private readonly grupoModel: typeof GrupoEntity,
	) {}

	async buscarUsuarioComGruposEPermissoes(userId: string): Promise<UsuarioEntity | null> {
		return this.usuarioModel.findByPk(userId, {
			include: [
				{
					model: GrupoEntity,
					as: "grupos",
					through: { attributes: [] },
					include: [
						{
							model: PermissaoEntity,
							as: "permissoes",
							through: { attributes: [] },
						},
					],
				},
			],
		});
	}

	async buscarUsuarioComGrupos(userId: string): Promise<UsuarioEntity | null> {
		return this.usuarioModel.findByPk(userId, {
			include: [
				{
					model: GrupoEntity,
					as: "grupos",
					through: { attributes: [] },
				},
			],
		});
	}

	async buscarTodasPermissoes(): Promise<PermissaoEntity[]> {
		return this.permissaoModel.findAll({ order: [["nome", "ASC"]] });
	}

	async buscarTodosGrupos(): Promise<GrupoEntity[]> {
		return this.grupoModel.findAll({ order: [["nome", "ASC"]] });
	}
}

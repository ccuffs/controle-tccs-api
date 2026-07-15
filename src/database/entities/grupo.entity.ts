import {
	AllowNull,
	AutoIncrement,
	BelongsToMany,
	Column,
	Default,
	Model,
	PrimaryKey,
	Table,
	DataType,
} from "sequelize-typescript";
import { GrupoPermissaoEntity } from "./grupo-permissao.entity";
import { PermissaoEntity } from "./permissao.entity";
import { UsuarioEntity } from "./usuario.entity";
import { UsuarioGrupoEntity } from "./usuario-grupo.entity";

@Table({
	modelName: "Grupo", tableName: "grupo", schema: "public", timestamps: true })
export class GrupoEntity extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare nome: string;

	@Column(DataType.STRING)
	declare descricao: string | null;

	@AllowNull(false)
	@Default(2)
	@Column(DataType.INTEGER)
	declare sistema: number;

	@BelongsToMany(() => PermissaoEntity, {
		through: () => GrupoPermissaoEntity,
		foreignKey: "id_grupo",
		otherKey: "id_permissao",
		as: "permissoes",
	})
	declare permissoes?: PermissaoEntity[];

	@BelongsToMany(() => UsuarioEntity, {
		through: () => UsuarioGrupoEntity,
		foreignKey: "id_grupo",
		otherKey: "id_usuario",
		as: "usuarios",
	})
	declare usuarios?: UsuarioEntity[];
}

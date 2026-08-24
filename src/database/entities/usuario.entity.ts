import { BelongsToMany, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import { CursoEntity } from "./curso.entity";
import { GrupoEntity } from "./grupo.entity";
import { UsuarioCursoEntity } from "./usuario-curso.entity";
import { UsuarioGrupoEntity } from "./usuario-grupo.entity";

@Table({
	modelName: "Usuario", tableName: "usuario", schema: "public", timestamps: true })
export class UsuarioEntity extends Model {
	@PrimaryKey
	@Column(DataType.STRING)
	declare id: string;

	@Column(DataType.STRING)
	declare nome: string | null;

	@Column(DataType.STRING)
	declare email: string | null;

	@Column(DataType.STRING)
	declare passwd: string | null;

	@BelongsToMany(() => CursoEntity, {
		through: () => UsuarioCursoEntity,
		foreignKey: "id_usuario",
		otherKey: "id_curso",
		as: "cursos",
	})
	declare cursos?: CursoEntity[];

	@BelongsToMany(() => GrupoEntity, {
		through: () => UsuarioGrupoEntity,
		foreignKey: "id_usuario",
		otherKey: "id_grupo",
		as: "grupos",
	})
	declare grupos?: GrupoEntity[];
}

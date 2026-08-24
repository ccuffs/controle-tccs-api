import { AllowNull, BelongsTo, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { CursoEntity } from "./curso.entity";
import { UsuarioEntity } from "./usuario.entity";

@Table({
	modelName: "UsuarioCurso", tableName: "usuario_curso", schema: "public", timestamps: true })
export class UsuarioCursoEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.INTEGER, references: { model: "curso", key: "id" } })
	declare id_curso: number;

	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.STRING, references: { model: "usuario", key: "id" } })
	declare id_usuario: string;

	@BelongsTo(() => CursoEntity, { foreignKey: "id_curso", targetKey: "id", as: "curso" })
	declare curso?: NonAttribute<CursoEntity>;

	@BelongsTo(() => UsuarioEntity, { foreignKey: "id_usuario", targetKey: "id", as: "usuario" })
	declare usuario?: NonAttribute<UsuarioEntity>;
}

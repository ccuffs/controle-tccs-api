import { AllowNull, BelongsTo, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { GrupoEntity } from "./grupo.entity";
import { UsuarioEntity } from "./usuario.entity";

@Table({
	modelName: "UsuarioGrupo", tableName: "usuario_grupo", schema: "public", timestamps: true })
export class UsuarioGrupoEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.INTEGER, references: { model: "grupo", key: "id" } })
	declare id_grupo: number;

	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.STRING, references: { model: "usuario", key: "id" } })
	declare id_usuario: string;

	@BelongsTo(() => GrupoEntity, { foreignKey: "id_grupo", targetKey: "id" })
	declare grupo?: NonAttribute<GrupoEntity>;

	@BelongsTo(() => UsuarioEntity, { foreignKey: "id_usuario", targetKey: "id" })
	declare usuario?: NonAttribute<UsuarioEntity>;
}

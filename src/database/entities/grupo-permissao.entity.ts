import { AllowNull, BelongsTo, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { GrupoEntity } from "./grupo.entity";
import { PermissaoEntity } from "./permissao.entity";

@Table({
	modelName: "GrupoPermissao", tableName: "grupo_permissao", schema: "public", timestamps: true })
export class GrupoPermissaoEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.INTEGER, references: { model: "grupo", key: "id" } })
	declare id_grupo: number;

	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.INTEGER, references: { model: "permissao", key: "id" } })
	declare id_permissao: number;

	@BelongsTo(() => GrupoEntity, { foreignKey: "id_grupo", targetKey: "id" })
	declare grupo?: NonAttribute<GrupoEntity>;

	@BelongsTo(() => PermissaoEntity, { foreignKey: "id_permissao", targetKey: "id" })
	declare permissao?: NonAttribute<PermissaoEntity>;
}

import { AllowNull, Column, HasMany, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import { PermissaoEntity } from "./permissao.entity";

@Table({
	modelName: "CategoriaPermissao", tableName: "categoria_permissao", schema: "public", timestamps: true })
export class CategoriaPermissaoEntity extends Model {
	@PrimaryKey
	@Column(DataType.STRING)
	declare codigo: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare descricao: string;

	@HasMany(() => PermissaoEntity, {
		foreignKey: "codigo_categoria_permissao",
		sourceKey: "codigo",
		as: "permissoes",
	})
	declare permissoes?: PermissaoEntity[];
}

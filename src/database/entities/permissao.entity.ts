import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	BelongsToMany,
	Column,
	Model,
	PrimaryKey,
	Table,
	DataType,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { CategoriaPermissaoEntity } from "./categoria-permissao.entity";
import { GrupoEntity } from "./grupo.entity";
import { GrupoPermissaoEntity } from "./grupo-permissao.entity";

@Table({
	modelName: "Permissao", tableName: "permissao", schema: "public", timestamps: true })
export class PermissaoEntity extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare codigo: string;

	@Column(DataType.STRING)
	declare descricao: string | null;

	@AllowNull(false)
	@Column({ type: DataType.STRING, references: { model: "categoria_permissao", key: "codigo" } })
	declare codigo_categoria_permissao: string;

	@BelongsTo(() => CategoriaPermissaoEntity, {
		foreignKey: "codigo_categoria_permissao",
		targetKey: "codigo",
		as: "categoria",
	})
	declare categoria?: NonAttribute<CategoriaPermissaoEntity>;

	@BelongsToMany(() => GrupoEntity, {
		through: () => GrupoPermissaoEntity,
		foreignKey: "id_permissao",
		otherKey: "id_grupo",
		as: "grupos",
	})
	declare grupos?: GrupoEntity[];
}

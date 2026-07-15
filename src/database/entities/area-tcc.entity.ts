import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	DataType,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { DocenteEntity } from "./docente.entity";
import { TemaTccEntity } from "./tema-tcc.entity";

@Table({
	modelName: "AreaTcc", tableName: "area_tcc", schema: "public", timestamps: true })
export class AreaTccEntity extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare descricao: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare codigo_docente: string;

	@BelongsTo(() => DocenteEntity, { foreignKey: "codigo_docente", targetKey: "codigo" })
	declare docente?: NonAttribute<DocenteEntity>;

	@HasMany(() => TemaTccEntity, { foreignKey: "id_area_tcc", sourceKey: "id" })
	declare temasTcc?: TemaTccEntity[];
}

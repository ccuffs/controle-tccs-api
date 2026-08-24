import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	Default,
	Model,
	PrimaryKey,
	Table,
	DataType,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { AreaTccEntity } from "./area-tcc.entity";
import { DocenteEntity } from "./docente.entity";

@Table({
	modelName: "TemaTcc", tableName: "tema_tcc", schema: "public", timestamps: true })
export class TemaTccEntity extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare descricao: string;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id_area_tcc: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare codigo_docente: string;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare ativo: boolean;

	@BelongsTo(() => AreaTccEntity, { foreignKey: "id_area_tcc", targetKey: "id" })
	declare areaTcc?: NonAttribute<AreaTccEntity>;

	@BelongsTo(() => DocenteEntity, { foreignKey: "codigo_docente", targetKey: "codigo" })
	declare docente?: NonAttribute<DocenteEntity>;
}

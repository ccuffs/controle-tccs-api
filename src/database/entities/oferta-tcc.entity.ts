import { AllowNull, BelongsTo, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { CursoEntity } from "./curso.entity";

@Table({
	modelName: "OfertaTcc", tableName: "oferta_tcc", schema: "public", timestamps: true })
export class OfertaTccEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare ano: number;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare semestre: number;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id_curso: number;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare fase: number;

	@BelongsTo(() => CursoEntity, { foreignKey: "id_curso", targetKey: "id" })
	declare curso?: NonAttribute<CursoEntity>;
}

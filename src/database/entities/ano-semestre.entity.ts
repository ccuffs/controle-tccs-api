import { col } from "sequelize";
import { AllowNull, Column, Default, HasMany, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import { DocenteOfertaEntity } from "./docente-oferta.entity";

@Table({
	modelName: "AnoSemestre", tableName: "ano_semestre", schema: "public", timestamps: true })
export class AnoSemestreEntity extends Model {
	@PrimaryKey
	@Column(DataType.INTEGER)
	declare ano: number;

	@PrimaryKey
	@Column(DataType.INTEGER)
	declare semestre: number;

	@AllowNull(false)
	@Default(DataType.NOW)
	@Column(DataType.DATE)
	declare inicio: Date;

	@AllowNull(false)
	@Default(DataType.NOW)
	@Column(DataType.DATE)
	declare fim: Date;

	@Default(false)
	@Column(DataType.BOOLEAN)
	declare publicado: boolean | null;

	@HasMany(() => DocenteOfertaEntity, {
		foreignKey: "ano",
		sourceKey: "ano",
		scope: { semestre: col("AnoSemestre.semestre") },
		constraints: false,
	})
	declare docenteOfertas?: DocenteOfertaEntity[];
}

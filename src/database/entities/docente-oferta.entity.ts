import { col } from "sequelize";
import { AllowNull, BelongsTo, Column, Default, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { AnoSemestreEntity } from "./ano-semestre.entity";
import { CursoEntity } from "./curso.entity";
import { DocenteEntity } from "./docente.entity";

@Table({
	modelName: "DocenteOferta", tableName: "docente_oferta", schema: "public", timestamps: true })
export class DocenteOfertaEntity extends Model {
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
	@Default(1)
	@Column(DataType.INTEGER)
	declare fase: number;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.STRING)
	declare codigo_docente: string;

	@AllowNull(false)
	@Default(0)
	@Column(DataType.INTEGER)
	declare vagas: number;

	@BelongsTo(() => DocenteEntity, { foreignKey: "codigo_docente", targetKey: "codigo" })
	declare docente?: NonAttribute<DocenteEntity>;

	@BelongsTo(() => CursoEntity, { foreignKey: "id_curso", targetKey: "id" })
	declare curso?: NonAttribute<CursoEntity>;

	@BelongsTo(() => AnoSemestreEntity, {
		foreignKey: "ano",
		targetKey: "ano",
		scope: { semestre: col("DocenteOferta.semestre") },
		constraints: false,
	})
	declare anoSemestre?: NonAttribute<AnoSemestreEntity>;
}

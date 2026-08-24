import { AllowNull, BelongsTo, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { CursoEntity } from "./curso.entity";
import { DocenteEntity } from "./docente.entity";

@Table({
	modelName: "BancaCurso", tableName: "banca_curso", schema: "public", timestamps: true })
export class BancaCursoEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.INTEGER, references: { model: "curso", key: "id" } })
	declare id_curso: number;

	@PrimaryKey
	@AllowNull(false)
	@Column({ type: DataType.STRING, references: { model: "docente", key: "codigo" } })
	declare codigo_docente: string;

	@BelongsTo(() => CursoEntity, { foreignKey: "id_curso", targetKey: "id", as: "curso" })
	declare curso?: NonAttribute<CursoEntity>;

	@BelongsTo(() => DocenteEntity, { foreignKey: "codigo_docente", targetKey: "codigo", as: "docente" })
	declare docente?: NonAttribute<DocenteEntity>;
}

import { AllowNull, BelongsTo, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { CursoEntity } from "./curso.entity";
import { OfertaTccEntity } from "./oferta-tcc.entity";

@Table({
	modelName: "DatasDefesaTcc", tableName: "datas_defesa_tccs", schema: "public", timestamps: true })
export class DatasDefesaTccEntity extends Model {
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

	@Column(DataType.DATEONLY)
	declare inicio: string | null;

	@Column(DataType.DATEONLY)
	declare fim: string | null;

	// As 4 associações abaixo replicam fielmente src/models/datas-defesa-tcc.js: nenhuma
	// define `as`, então o Sequelize usa o alias padrão "OfertaTcc" nas 4 e cada declaração
	// sobrescreve a anterior (só a última, por "fase", fica de fato acessível via include).
	@BelongsTo(() => OfertaTccEntity, { foreignKey: { name: "ano", field: "ano" }, targetKey: "ano", constraints: false })
	declare ofertaTccPorAno?: NonAttribute<OfertaTccEntity>;

	@BelongsTo(() => OfertaTccEntity, {
		foreignKey: { name: "semestre", field: "semestre" },
		targetKey: "semestre",
		constraints: false,
	})
	declare ofertaTccPorSemestre?: NonAttribute<OfertaTccEntity>;

	@BelongsTo(() => OfertaTccEntity, {
		foreignKey: { name: "id_curso", field: "id_curso" },
		targetKey: "id_curso",
		constraints: false,
	})
	declare ofertaTccPorCurso?: NonAttribute<OfertaTccEntity>;

	@BelongsTo(() => OfertaTccEntity, { foreignKey: { name: "fase", field: "fase" }, targetKey: "fase", constraints: false })
	declare ofertaTcc?: NonAttribute<OfertaTccEntity>;

	@BelongsTo(() => CursoEntity, { foreignKey: "id_curso", targetKey: "id" })
	declare curso?: NonAttribute<CursoEntity>;
}

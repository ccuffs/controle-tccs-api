import { AllowNull, BelongsTo, Column, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { CursoEntity } from "./curso.entity";
import { DocenteEntity } from "./docente.entity";
import { OfertaTccEntity } from "./oferta-tcc.entity";

@Table({
	modelName: "DocenteDisponibilidadeBanca", tableName: "docente_disponibilidade_banca", schema: "public", timestamps: true })
export class DocenteDisponibilidadeBancaEntity extends Model {
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

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.STRING)
	declare codigo_docente: string;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.DATEONLY)
	declare data_defesa: string;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.TIME)
	declare hora_defesa: string;

	// As 4 associações abaixo replicam fielmente src/models/docente-disponibilidade-banca.js:
	// nenhuma define `as`, então o Sequelize usa o alias padrão "OfertaTcc" nas 4 e cada
	// declaração sobrescreve a anterior (só a última, por "fase", fica de fato acessível
	// via include). Os nomes de propriedade abaixo são só para leitura no TS.
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

	@BelongsTo(() => DocenteEntity, { foreignKey: "codigo_docente", targetKey: "codigo" })
	declare docente?: NonAttribute<DocenteEntity>;

	@BelongsTo(() => CursoEntity, { foreignKey: "id_curso", targetKey: "id" })
	declare curso?: NonAttribute<CursoEntity>;
}

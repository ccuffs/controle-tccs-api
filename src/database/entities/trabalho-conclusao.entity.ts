import {
	AllowNull,
	AutoIncrement,
	BelongsTo,
	Column,
	Default,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	DataType,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { ConviteEntity } from "./convite.entity";
import { CursoEntity } from "./curso.entity";
import { DefesaEntity } from "./defesa.entity";
import { DicenteEntity } from "./dicente.entity";
import { OrientacaoEntity } from "./orientacao.entity";

@Table({
	modelName: "TrabalhoConclusao",
	tableName: "trabalho_conclusao",
	schema: "public",
	timestamps: true,
	indexes: [
		{
			unique: true,
			name: "tcc_unique",
			fields: ["id", "ano", "semestre", "id_curso", "fase", "matricula"],
		},
	],
})
export class TrabalhoConclusaoEntity extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare ano: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare semestre: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id_curso: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare fase: number;

	@AllowNull(false)
	@Column(DataType.BIGINT)
	declare matricula: string;

	@Column(DataType.STRING)
	declare tema: string | null;

	@Column(DataType.STRING)
	declare titulo: string | null;

	@Column(DataType.TEXT)
	declare resumo: string | null;

	@Column(DataType.TEXT)
	declare seminario_andamento: string | null;

	@Default(0)
	@Column(DataType.INTEGER)
	declare etapa: number | null;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare aprovado_projeto: boolean;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare aprovado_tcc: boolean;

	@Column(DataType.TEXT)
	declare comentarios_tcc: string | null;

	@BelongsTo(() => DicenteEntity, { foreignKey: "matricula", targetKey: "matricula" })
	declare dicente?: NonAttribute<DicenteEntity>;

	@BelongsTo(() => CursoEntity, { foreignKey: "id_curso", targetKey: "id" })
	declare curso?: NonAttribute<CursoEntity>;

	@HasMany(() => OrientacaoEntity, { foreignKey: "id_tcc", sourceKey: "id" })
	declare orientacoes?: OrientacaoEntity[];

	@HasMany(() => ConviteEntity, { foreignKey: "id_tcc", sourceKey: "id" })
	declare convites?: ConviteEntity[];

	@HasMany(() => DefesaEntity, { foreignKey: "id_tcc", sourceKey: "id" })
	declare defesas?: DefesaEntity[];
}

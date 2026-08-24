import { AllowNull, BelongsTo, Column, Default, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { DocenteEntity } from "./docente.entity";
import { TrabalhoConclusaoEntity } from "./trabalho-conclusao.entity";

@Table({
	modelName: "Convite", tableName: "convite", schema: "public", timestamps: true })
export class ConviteEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id_tcc: number;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.STRING)
	declare codigo_docente: string;

	@PrimaryKey
	@AllowNull(false)
	@Default(0)
	@Column(DataType.INTEGER)
	declare fase: number;

	@AllowNull(false)
	@Column(DataType.DATE)
	declare data_envio: Date;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare mensagem_envio: string;

	@Column(DataType.DATE)
	declare data_feedback: Date | null;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare aceito: boolean;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare mensagem_feedback: string;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare orientacao: boolean;

	@BelongsTo(() => TrabalhoConclusaoEntity, { foreignKey: "id_tcc", targetKey: "id" })
	declare trabalhoConclusao?: NonAttribute<TrabalhoConclusaoEntity>;

	@BelongsTo(() => DocenteEntity, { foreignKey: "codigo_docente", targetKey: "codigo" })
	declare docente?: NonAttribute<DocenteEntity>;
}

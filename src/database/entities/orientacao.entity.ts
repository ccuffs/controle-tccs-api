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
import { DocenteEntity } from "./docente.entity";
import { TrabalhoConclusaoEntity } from "./trabalho-conclusao.entity";

@Table({
	modelName: "Orientacao", tableName: "orientacao", schema: "public", timestamps: true })
export class OrientacaoEntity extends Model {
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare codigo_docente: string;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id_tcc: number;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare orientador: boolean;

	@BelongsTo(() => DocenteEntity, { foreignKey: "codigo_docente", targetKey: "codigo" })
	declare docente?: NonAttribute<DocenteEntity>;

	@BelongsTo(() => TrabalhoConclusaoEntity, { foreignKey: "id_tcc", targetKey: "id" })
	declare trabalhoConclusao?: NonAttribute<TrabalhoConclusaoEntity>;
}

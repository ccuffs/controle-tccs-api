import { AllowNull, BelongsTo, Column, Default, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { DocenteEntity } from "./docente.entity";
import { TrabalhoConclusaoEntity } from "./trabalho-conclusao.entity";

@Table({
	modelName: "Defesa", tableName: "defesa", schema: "public", timestamps: true })
export class DefesaEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare id_tcc: number;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.STRING)
	declare membro_banca: string;

	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare fase: number;

	@Column(DataType.DATE)
	declare data_defesa: Date | null;

	@Column(DataType.FLOAT)
	declare avaliacao: number | null;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare orientador: boolean;

	@BelongsTo(() => TrabalhoConclusaoEntity, { foreignKey: "id_tcc", targetKey: "id" })
	declare trabalhoConclusao?: NonAttribute<TrabalhoConclusaoEntity>;

	@BelongsTo(() => DocenteEntity, {
		foreignKey: "membro_banca",
		targetKey: "codigo",
		as: "membroBanca",
	})
	declare membroBanca?: NonAttribute<DocenteEntity>;
}

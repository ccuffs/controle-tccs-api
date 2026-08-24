import { AllowNull, BelongsTo, Column, HasMany, Model, PrimaryKey, Table, DataType } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { TrabalhoConclusaoEntity } from "./trabalho-conclusao.entity";
import { UsuarioEntity } from "./usuario.entity";

@Table({
	modelName: "Dicente", tableName: "dicente", schema: "public", timestamps: true })
export class DicenteEntity extends Model {
	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.BIGINT)
	declare matricula: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare nome: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare email: string;

	@Column(DataType.STRING)
	declare id_usuario: string | null;

	@BelongsTo(() => UsuarioEntity, { foreignKey: "id_usuario", targetKey: "id" })
	declare usuario?: NonAttribute<UsuarioEntity>;

	@HasMany(() => TrabalhoConclusaoEntity, { foreignKey: "matricula", sourceKey: "matricula" })
	declare trabalhosConclusao?: TrabalhoConclusaoEntity[];
}

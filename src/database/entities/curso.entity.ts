import {
	AutoIncrement,
	BelongsTo,
	BelongsToMany,
	Column,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	DataType,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { DocenteCursoEntity } from "./docente-curso.entity";
import { DocenteEntity } from "./docente.entity";
import { DocenteOfertaEntity } from "./docente-oferta.entity";
import { OrientadorCursoEntity } from "./orientador-curso.entity";
import { TrabalhoConclusaoEntity } from "./trabalho-conclusao.entity";
import { UsuarioCursoEntity } from "./usuario-curso.entity";
import { UsuarioEntity } from "./usuario.entity";

@Table({
	modelName: "Curso", tableName: "curso", schema: "public", timestamps: true })
export class CursoEntity extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@Column(DataType.INTEGER)
	declare codigo: number | null;

	@Column(DataType.TEXT)
	declare nome: string | null;

	@Column(DataType.TEXT)
	declare turno: string | null;

	@Column(DataType.STRING)
	declare coordenador: string | null;

	@BelongsTo(() => DocenteEntity, {
		foreignKey: "coordenador",
		targetKey: "codigo",
		as: "coordenadorDocente",
	})
	declare coordenadorDocente?: NonAttribute<DocenteEntity>;

	@BelongsToMany(() => DocenteEntity, {
		through: () => DocenteCursoEntity,
		foreignKey: "id_curso",
		otherKey: "codigo_docente",
		as: "docentes",
	})
	declare docentes?: DocenteEntity[];

	@BelongsToMany(() => DocenteEntity, {
		through: () => OrientadorCursoEntity,
		foreignKey: "id_curso",
		otherKey: "codigo_docente",
		as: "orientadores",
	})
	declare orientadores?: DocenteEntity[];

	@BelongsToMany(() => UsuarioEntity, {
		through: () => UsuarioCursoEntity,
		foreignKey: "id_curso",
		otherKey: "id_usuario",
		as: "usuarios",
	})
	declare usuarios?: UsuarioEntity[];

	@HasMany(() => TrabalhoConclusaoEntity, { foreignKey: "id_curso", sourceKey: "id" })
	declare trabalhosConclusao?: TrabalhoConclusaoEntity[];

	@HasMany(() => DocenteOfertaEntity, { foreignKey: "id_curso", sourceKey: "id" })
	declare docenteOfertas?: DocenteOfertaEntity[];
}

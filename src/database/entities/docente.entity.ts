import {
	AllowNull,
	BelongsTo,
	BelongsToMany,
	Column,
	Default,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	DataType,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { AreaTccEntity } from "./area-tcc.entity";
import { ConviteEntity } from "./convite.entity";
import { CursoEntity } from "./curso.entity";
import { DefesaEntity } from "./defesa.entity";
import { DocenteCursoEntity } from "./docente-curso.entity";
import { DocenteOfertaEntity } from "./docente-oferta.entity";
import { OrientacaoEntity } from "./orientacao.entity";
import { OrientadorCursoEntity } from "./orientador-curso.entity";
import { TemaTccEntity } from "./tema-tcc.entity";
import { UsuarioEntity } from "./usuario.entity";

@Table({
	modelName: "Docente", tableName: "docente", schema: "public", timestamps: true })
export class DocenteEntity extends Model {
	@PrimaryKey
	@Column(DataType.STRING)
	declare codigo: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare email: string;

	@Column(DataType.STRING)
	declare nome: string | null;

	@Column(DataType.INTEGER)
	declare sala: number | null;

	@Column(DataType.INTEGER)
	declare siape: number | null;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare externo: boolean;

	@Column(DataType.STRING)
	declare instituicao: string | null;

	@Column(DataType.STRING)
	declare id_usuario: string | null;

	@BelongsTo(() => UsuarioEntity, { foreignKey: "id_usuario", targetKey: "id" })
	declare usuario?: NonAttribute<UsuarioEntity>;

	@BelongsToMany(() => CursoEntity, {
		through: () => DocenteCursoEntity,
		foreignKey: "codigo_docente",
		otherKey: "id_curso",
		as: "cursos",
	})
	declare cursos?: CursoEntity[];

	@BelongsToMany(() => CursoEntity, {
		through: () => OrientadorCursoEntity,
		foreignKey: "codigo_docente",
		otherKey: "id_curso",
		as: "cursosOrientacao",
	})
	declare cursosOrientacao?: CursoEntity[];

	@HasMany(() => OrientacaoEntity, { foreignKey: "codigo_docente", sourceKey: "codigo" })
	declare orientacoes?: OrientacaoEntity[];

	@HasMany(() => ConviteEntity, { foreignKey: "codigo_docente", sourceKey: "codigo" })
	declare convites?: ConviteEntity[];

	@HasMany(() => DefesaEntity, {
		foreignKey: "membro_banca",
		sourceKey: "codigo",
		as: "defesas",
	})
	declare defesas?: DefesaEntity[];

	@HasMany(() => AreaTccEntity, { foreignKey: "codigo_docente", sourceKey: "codigo" })
	declare areasTcc?: AreaTccEntity[];

	@HasMany(() => TemaTccEntity, { foreignKey: "codigo_docente", sourceKey: "codigo" })
	declare temasTcc?: TemaTccEntity[];

	@HasMany(() => DocenteOfertaEntity, { foreignKey: "codigo_docente", sourceKey: "codigo" })
	declare docenteOfertas?: DocenteOfertaEntity[];

	@HasMany(() => CursoEntity, {
		foreignKey: "coordenador",
		sourceKey: "codigo",
		as: "cursosCoordenados",
	})
	declare cursosCoordenados?: CursoEntity[];
}

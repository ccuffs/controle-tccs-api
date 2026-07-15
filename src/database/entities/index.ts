import { AnoSemestreEntity } from "./ano-semestre.entity";
import { AreaTccEntity } from "./area-tcc.entity";
import { BancaCursoEntity } from "./banca-curso.entity";
import { CategoriaPermissaoEntity } from "./categoria-permissao.entity";
import { ConviteEntity } from "./convite.entity";
import { CursoEntity } from "./curso.entity";
import { DatasDefesaTccEntity } from "./datas-defesa-tcc.entity";
import { DefesaEntity } from "./defesa.entity";
import { DicenteEntity } from "./dicente.entity";
import { DocenteCursoEntity } from "./docente-curso.entity";
import { DocenteDisponibilidadeBancaEntity } from "./docente-disponibilidade-banca.entity";
import { DocenteOfertaEntity } from "./docente-oferta.entity";
import { DocenteEntity } from "./docente.entity";
import { GrupoPermissaoEntity } from "./grupo-permissao.entity";
import { GrupoEntity } from "./grupo.entity";
import { OfertaTccEntity } from "./oferta-tcc.entity";
import { OrientacaoEntity } from "./orientacao.entity";
import { OrientadorCursoEntity } from "./orientador-curso.entity";
import { PermissaoEntity } from "./permissao.entity";
import { TemaTccEntity } from "./tema-tcc.entity";
import { TrabalhoConclusaoEntity } from "./trabalho-conclusao.entity";
import { UsuarioCursoEntity } from "./usuario-curso.entity";
import { UsuarioGrupoEntity } from "./usuario-grupo.entity";
import { UsuarioEntity } from "./usuario.entity";

export * from "./ano-semestre.entity";
export * from "./area-tcc.entity";
export * from "./banca-curso.entity";
export * from "./categoria-permissao.entity";
export * from "./convite.entity";
export * from "./curso.entity";
export * from "./datas-defesa-tcc.entity";
export * from "./defesa.entity";
export * from "./dicente.entity";
export * from "./docente-curso.entity";
export * from "./docente-disponibilidade-banca.entity";
export * from "./docente-oferta.entity";
export * from "./docente.entity";
export * from "./grupo-permissao.entity";
export * from "./grupo.entity";
export * from "./oferta-tcc.entity";
export * from "./orientacao.entity";
export * from "./orientador-curso.entity";
export * from "./permissao.entity";
export * from "./tema-tcc.entity";
export * from "./trabalho-conclusao.entity";
export * from "./usuario-curso.entity";
export * from "./usuario-grupo.entity";
export * from "./usuario.entity";

/** Todas as entities, para registro em SequelizeModule.forRoot({ models: [...] }). */
export const ENTITIES = [
	AnoSemestreEntity,
	AreaTccEntity,
	BancaCursoEntity,
	CategoriaPermissaoEntity,
	ConviteEntity,
	CursoEntity,
	DatasDefesaTccEntity,
	DefesaEntity,
	DicenteEntity,
	DocenteCursoEntity,
	DocenteDisponibilidadeBancaEntity,
	DocenteOfertaEntity,
	DocenteEntity,
	GrupoPermissaoEntity,
	GrupoEntity,
	OfertaTccEntity,
	OrientacaoEntity,
	OrientadorCursoEntity,
	PermissaoEntity,
	TemaTccEntity,
	TrabalhoConclusaoEntity,
	UsuarioCursoEntity,
	UsuarioGrupoEntity,
	UsuarioEntity,
];

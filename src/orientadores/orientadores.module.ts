import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import {
	DocenteEntity,
	OrientacaoEntity,
	OrientadorCursoEntity,
	TrabalhoConclusaoEntity,
	UsuarioCursoEntity,
	UsuarioEntity,
	UsuarioGrupoEntity,
} from "../database/entities";
import { AnoSemestreModule } from "../ano-semestre/ano-semestre.module";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { OrientadoresController } from "./orientadores.controller";
import { OrientadoresRepository } from "./orientadores.repository";
import { OrientadoresService } from "./orientadores.service";

@Module({
	imports: [
		SequelizeModule.forFeature([
			OrientadorCursoEntity,
			DocenteEntity,
			UsuarioEntity,
			UsuarioGrupoEntity,
			UsuarioCursoEntity,
			OrientacaoEntity,
			TrabalhoConclusaoEntity,
		]),
		AnoSemestreModule,
		PermissoesModule,
	],
	controllers: [OrientadoresController],
	providers: [OrientadoresRepository, OrientadoresService],
})
export class OrientadoresModule {}

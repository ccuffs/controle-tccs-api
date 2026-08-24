import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import {
	DicenteEntity,
	OrientacaoEntity,
	TrabalhoConclusaoEntity,
	UsuarioCursoEntity,
	UsuarioEntity,
	UsuarioGrupoEntity,
} from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DicentesController } from "./dicentes.controller";
import { DicentesRepository } from "./dicentes.repository";
import { DicentesService } from "./dicentes.service";
import { LdapDicentesService } from "./ldap-dicentes.service";
import { PdfDicentesService } from "./pdf-dicentes.service";

@Module({
	imports: [
		SequelizeModule.forFeature([
			DicenteEntity,
			TrabalhoConclusaoEntity,
			OrientacaoEntity,
			UsuarioEntity,
			UsuarioCursoEntity,
			UsuarioGrupoEntity,
		]),
		PermissoesModule,
	],
	controllers: [DicentesController],
	providers: [DicentesRepository, DicentesService, PdfDicentesService, LdapDicentesService],
})
export class DicentesModule {}

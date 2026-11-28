import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DicenteEntity, GrupoEntity, PermissaoEntity, TrabalhoConclusaoEntity, UsuarioEntity } from "../database/entities";
import { PermissoesRepository } from "./permissoes.repository";
import { PermissoesService } from "./permissoes.service";

@Module({
	imports: [SequelizeModule.forFeature([UsuarioEntity, PermissaoEntity, GrupoEntity, DicenteEntity, TrabalhoConclusaoEntity])],
	providers: [PermissoesRepository, PermissoesService],
	exports: [PermissoesService],
})
export class PermissoesModule {}

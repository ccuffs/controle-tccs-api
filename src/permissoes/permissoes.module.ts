import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GrupoEntity, PermissaoEntity, UsuarioEntity } from "../database/entities";
import { PermissoesRepository } from "./permissoes.repository";
import { PermissoesService } from "./permissoes.service";

@Module({
	imports: [SequelizeModule.forFeature([UsuarioEntity, PermissaoEntity, GrupoEntity])],
	providers: [PermissoesRepository, PermissoesService],
	exports: [PermissoesService],
})
export class PermissoesModule {}

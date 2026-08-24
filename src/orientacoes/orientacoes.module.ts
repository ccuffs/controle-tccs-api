import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { OrientacaoEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { OrientacoesController } from "./orientacoes.controller";
import { OrientacoesRepository } from "./orientacoes.repository";
import { OrientacoesService } from "./orientacoes.service";

@Module({
	imports: [SequelizeModule.forFeature([OrientacaoEntity]), PermissoesModule],
	controllers: [OrientacoesController],
	providers: [OrientacoesRepository, OrientacoesService],
	exports: [OrientacoesService, OrientacoesRepository],
})
export class OrientacoesModule {}

import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConviteEntity, DefesaEntity, OrientacaoEntity, TrabalhoConclusaoEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DeclaracoesController } from "./declaracoes.controller";
import { DeclaracoesRepository } from "./declaracoes.repository";
import { DeclaracoesService } from "./declaracoes.service";

@Module({
	imports: [
		SequelizeModule.forFeature([OrientacaoEntity, ConviteEntity, DefesaEntity, TrabalhoConclusaoEntity]),
		PermissoesModule,
	],
	controllers: [DeclaracoesController],
	providers: [DeclaracoesRepository, DeclaracoesService],
})
export class DeclaracoesModule {}

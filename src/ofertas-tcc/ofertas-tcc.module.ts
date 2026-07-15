import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AnoSemestreModule } from "../ano-semestre/ano-semestre.module";
import { OfertaTccEntity, TrabalhoConclusaoEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { OfertasTccController } from "./ofertas-tcc.controller";
import { OfertasTccRepository } from "./ofertas-tcc.repository";
import { OfertasTccService } from "./ofertas-tcc.service";

@Module({
	imports: [
		SequelizeModule.forFeature([OfertaTccEntity, TrabalhoConclusaoEntity]),
		PermissoesModule,
		AnoSemestreModule,
	],
	controllers: [OfertasTccController],
	providers: [OfertasTccRepository, OfertasTccService],
	exports: [OfertasTccService],
})
export class OfertasTccModule {}

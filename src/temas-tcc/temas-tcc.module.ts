import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AnoSemestreModule } from "../ano-semestre/ano-semestre.module";
import { DocenteOfertaEntity, TemaTccEntity } from "../database/entities";
import { OfertasTccModule } from "../ofertas-tcc/ofertas-tcc.module";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { TemasTccController } from "./temas-tcc.controller";
import { TemasTccRepository } from "./temas-tcc.repository";
import { TemasTccService } from "./temas-tcc.service";

@Module({
	imports: [
		SequelizeModule.forFeature([TemaTccEntity, DocenteOfertaEntity]),
		PermissoesModule,
		AnoSemestreModule,
		OfertasTccModule,
	],
	controllers: [TemasTccController],
	providers: [TemasTccRepository, TemasTccService],
	exports: [TemasTccService, TemasTccRepository],
})
export class TemasTccModule {}

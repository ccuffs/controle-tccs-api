import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConviteEntity, TrabalhoConclusaoEntity } from "../database/entities";
import { DocentesModule } from "../docentes/docentes.module";
import { OrientacoesModule } from "../orientacoes/orientacoes.module";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { TemasTccModule } from "../temas-tcc/temas-tcc.module";
import { ConvitesController } from "./convites.controller";
import { ConvitesRepository } from "./convites.repository";
import { ConvitesService } from "./convites.service";

@Module({
	imports: [
		SequelizeModule.forFeature([ConviteEntity, TrabalhoConclusaoEntity]),
		PermissoesModule,
		DocentesModule,
		TemasTccModule,
		OrientacoesModule,
	],
	controllers: [ConvitesController],
	providers: [ConvitesRepository, ConvitesService],
})
export class ConvitesModule {}

import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import {
	ConviteEntity,
	DefesaEntity,
	DocenteDisponibilidadeBancaEntity,
	OrientacaoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";
import { DocentesModule } from "../docentes/docentes.module";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DefesasController } from "./defesas.controller";
import { DefesasRepository } from "./defesas.repository";
import { DefesasService } from "./defesas.service";

@Module({
	imports: [
		SequelizeModule.forFeature([DefesaEntity, TrabalhoConclusaoEntity, DocenteDisponibilidadeBancaEntity, ConviteEntity, OrientacaoEntity]),
		PermissoesModule,
		DocentesModule,
	],
	controllers: [DefesasController],
	providers: [DefesasRepository, DefesasService],
})
export class DefesasModule {}

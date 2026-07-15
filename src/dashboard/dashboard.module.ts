import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AnoSemestreModule } from "../ano-semestre/ano-semestre.module";
import {
	AnoSemestreEntity,
	BancaCursoEntity,
	ConviteEntity,
	DefesaEntity,
	DocenteDisponibilidadeBancaEntity,
	OrientacaoEntity,
	OrientadorCursoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardRepository } from "./dashboard.repository";
import { DashboardService } from "./dashboard.service";

@Module({
	imports: [
		SequelizeModule.forFeature([
			TrabalhoConclusaoEntity,
			AnoSemestreEntity,
			ConviteEntity,
			OrientadorCursoEntity,
			OrientacaoEntity,
			DefesaEntity,
			DocenteDisponibilidadeBancaEntity,
			BancaCursoEntity,
		]),
		PermissoesModule,
		AnoSemestreModule,
	],
	controllers: [DashboardController],
	providers: [DashboardRepository, DashboardService],
})
export class DashboardModule {}

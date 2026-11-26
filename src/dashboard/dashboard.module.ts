import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AnoSemestreModule } from "../ano-semestre/ano-semestre.module";
import {
	AnoSemestreEntity,
	BancaCursoEntity,
	ConviteEntity,
	CursoEntity,
	DatasDefesaTccEntity,
	DefesaEntity,
	DicenteEntity,
	DocenteEntity,
	DocenteDisponibilidadeBancaEntity,
	OrientacaoEntity,
	OrientadorCursoEntity,
	TrabalhoConclusaoEntity,
} from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardRepository } from "./dashboard.repository";
import { DashboardService } from "./dashboard.service";
import { EscopoDocenteService } from "./escopo-docente.service";

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
			DatasDefesaTccEntity,
			DicenteEntity,
			CursoEntity,
			DocenteEntity,
		]),
		PermissoesModule,
		AnoSemestreModule,
	],
	controllers: [DashboardController],
	providers: [DashboardRepository, DashboardService, EscopoDocenteService],
})
export class DashboardModule {}

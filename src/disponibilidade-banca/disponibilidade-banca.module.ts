import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DatasDefesaModule } from "../datas-defesa/datas-defesa.module";
import { DocenteDisponibilidadeBancaEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DisponibilidadeBancaController } from "./disponibilidade-banca.controller";
import { DisponibilidadeBancaRepository } from "./disponibilidade-banca.repository";
import { DisponibilidadeBancaService } from "./disponibilidade-banca.service";

@Module({
	imports: [SequelizeModule.forFeature([DocenteDisponibilidadeBancaEntity]), PermissoesModule, DatasDefesaModule],
	controllers: [DisponibilidadeBancaController],
	providers: [DisponibilidadeBancaRepository, DisponibilidadeBancaService],
})
export class DisponibilidadeBancaModule {}

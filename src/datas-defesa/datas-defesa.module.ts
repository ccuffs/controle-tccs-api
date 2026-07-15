import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DatasDefesaTccEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { DatasDefesaController } from "./datas-defesa.controller";
import { DatasDefesaRepository } from "./datas-defesa.repository";
import { DatasDefesaService } from "./datas-defesa.service";

@Module({
	imports: [SequelizeModule.forFeature([DatasDefesaTccEntity]), PermissoesModule],
	controllers: [DatasDefesaController],
	providers: [DatasDefesaRepository, DatasDefesaService],
	exports: [DatasDefesaService, DatasDefesaRepository],
})
export class DatasDefesaModule {}

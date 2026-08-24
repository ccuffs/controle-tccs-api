import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AnoSemestreEntity } from "../database/entities";
import { AnoSemestreController } from "./ano-semestre.controller";
import { AnoSemestreRepository } from "./ano-semestre.repository";
import { AnoSemestreService } from "./ano-semestre.service";

@Module({
	imports: [SequelizeModule.forFeature([AnoSemestreEntity])],
	controllers: [AnoSemestreController],
	providers: [AnoSemestreRepository, AnoSemestreService],
	exports: [AnoSemestreService],
})
export class AnoSemestreModule {}

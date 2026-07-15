import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BancaCursoEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { BancaCursoController } from "./banca-curso.controller";
import { BancaCursoRepository } from "./banca-curso.repository";
import { BancaCursoService } from "./banca-curso.service";

@Module({
	imports: [SequelizeModule.forFeature([BancaCursoEntity]), PermissoesModule],
	controllers: [BancaCursoController],
	providers: [BancaCursoRepository, BancaCursoService],
})
export class BancaCursoModule {}

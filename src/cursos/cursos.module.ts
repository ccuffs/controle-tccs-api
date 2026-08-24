import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CursoEntity } from "../database/entities";
import { PermissoesModule } from "../permissoes/permissoes.module";
import { CursosController } from "./cursos.controller";
import { CursosRepository } from "./cursos.repository";
import { CursosService } from "./cursos.service";

@Module({
	imports: [SequelizeModule.forFeature([CursoEntity]), PermissoesModule],
	controllers: [CursosController],
	providers: [CursosRepository, CursosService],
})
export class CursosModule {}

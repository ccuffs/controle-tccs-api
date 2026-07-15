import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AnoSemestreService } from "./ano-semestre.service";

/** Porta de src/resources/ano-semestre-resource.js. */
@Controller("ano-semestre")
@UseGuards(JwtAuthGuard)
export class AnoSemestreController {
	constructor(private readonly anoSemestreService: AnoSemestreService) {}

	@Get("atual")
	async obterAnoSemestreAtual() {
		return this.anoSemestreService.calcularAnoSemestreAtual();
	}

	@Get()
	async listarTodosAnoSemestres() {
		return this.anoSemestreService.listarTodosAnoSemestres();
	}
}

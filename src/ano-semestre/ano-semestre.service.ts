import { Injectable } from "@nestjs/common";
import { AnoSemestreEntity } from "../database/entities";
import { AnoSemestreRepository } from "./ano-semestre.repository";

export interface AnoSemestreAtual {
	ano: number;
	semestre: number;
}

/** Porta de src/services/ano-semestre-service.js. */
@Injectable()
export class AnoSemestreService {
	constructor(private readonly anoSemestreRepository: AnoSemestreRepository) {}

	listarTodosAnoSemestres(): Promise<AnoSemestreEntity[]> {
		return this.anoSemestreRepository.obterTodosAnoSemestres();
	}

	/**
	 * Regras de negócio para cálculo de ano/semestre atual (porta fiel de
	 * `calcularAnoSemestreAtual` em ano-semestre-service.js):
	 * 1. Se estivermos dentro do período de duração de um semestre, retorna o ano/semestre atual.
	 * 2. Se estivermos no intervalo entre semestres:
	 *    2.1. A menos de 10 dias do início do próximo semestre, retorna o próximo.
	 *    2.2. A mais de 10 dias, retorna o período passado mais recente.
	 */
	async calcularAnoSemestreAtual(): Promise<AnoSemestreAtual> {
		try {
			const dataAtual = new Date();
			const periodos = await this.anoSemestreRepository.obterTodosAnoSemestres();

			if (periodos.length === 0) {
				return this.fallbackSimples(dataAtual);
			}

			for (const periodo of periodos) {
				const inicio = new Date(periodo.inicio);
				const fim = new Date(periodo.fim);

				if (dataAtual >= inicio && dataAtual <= fim) {
					return { ano: periodo.ano, semestre: periodo.semestre };
				}
			}

			const proximoPeriodo = periodos.find((p) => new Date(p.inicio) > dataAtual);

			if (proximoPeriodo) {
				const inicioProximo = new Date(proximoPeriodo.inicio);
				const diasParaProximo = Math.ceil(
					(inicioProximo.getTime() - dataAtual.getTime()) / (1000 * 60 * 60 * 24),
				);

				if (diasParaProximo <= 10) {
					return { ano: proximoPeriodo.ano, semestre: proximoPeriodo.semestre };
				}
			}

			const periodosPassados = periodos.filter((p) => new Date(p.fim) < dataAtual);
			if (periodosPassados.length > 0) {
				const ultimoPeriodo = periodosPassados[periodosPassados.length - 1];
				return { ano: ultimoPeriodo.ano, semestre: ultimoPeriodo.semestre };
			}

			return this.fallbackSimples(dataAtual);
		} catch {
			return this.fallbackSimples(new Date());
		}
	}

	private fallbackSimples(dataAtual: Date): AnoSemestreAtual {
		const anoAtual = dataAtual.getFullYear();
		const semestreAtual = dataAtual.getMonth() < 6 ? 1 : 2;
		return { ano: anoAtual, semestre: semestreAtual };
	}
}

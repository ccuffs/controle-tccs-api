const anoSemestreRepository = require("../repository/ano-semestre-repository");

// Função para obter ano/semestre atual baseado nas regras de negócio
const obterAnoSemestreAtual = async (req, res) => {
	try {
		const atual = await calcularAnoSemestreAtual();
		res.status(200).json(atual);
	} catch (error) {
		console.error("Erro ao obter ano/semestre atual:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

// Função para listar todos os períodos cadastrados
const listarTodosAnoSemestres = async (req, res) => {
	try {
		const lista = await anoSemestreRepository.obterTodosAnoSemestres();
		res.status(200).json(lista);
	} catch (error) {
		console.error("Erro ao listar ano/semestre:", error);
		res.status(500).json({ message: "Erro interno do servidor" });
	}
};

/**
 * Função utilitária para calcular ano/semestre atual baseado na tabela ano_semestre
 *
 * Regras de negócio para cálculo de ano/semestre:
 * 1. Se estivermos dentro do período de duração de um semestre, retorna o ano/semestre atual
 * 2. Se estivermos no intervalo entre semestres:
 *    2.1. Se estivermos a menos de 10 dias do início do próximo semestre, retorna ano/semestre seguintes
 *    2.2. Se estivermos a mais de 10 dias do início do próximo semestre, retorna ano/semestre passados
 *
 * Exemplos (considerando 2025/1: 10/03/2025-18/07/2025; 2025/2: 11/08/2025-19/12/2025):
 * - 26/07/2025 → 2025/1 (intervalo, mas > 10 dias para próximo)
 * - 10/04/2025 → 2025/1 (dentro do período)
 * - 11/01/2025 → 2024/2 (intervalo, > 10 dias para próximo)
 * - 05/08/2025 → 2025/2 (intervalo, < 10 dias para próximo)
 * - 30/10/2025 → 2025/2 (dentro do período)
 * - 30/12/2025 → 2025/2 (intervalo, > 10 dias para próximo)
 * - 17/01/2026 → 2025/2 (intervalo, > 10 dias para próximo)
 *
 * @returns {Promise<{ano: number, semestre: number}>} Objeto com ano e semestre
 */
const calcularAnoSemestreAtual = async () => {
	try {
		const dataAtual = new Date();

		// Buscar todos os períodos ordenados por ano e semestre
		const periodos = await anoSemestreRepository.obterTodosAnoSemestres();

		if (periodos.length === 0) {
			// Fallback para lógica simples se não houver dados
			const anoAtual = dataAtual.getFullYear();
			const semestreAtual = dataAtual.getMonth() < 6 ? 1 : 2;
			return { ano: anoAtual, semestre: semestreAtual };
		}

		// Verificar se estamos dentro do período de algum semestre
		for (const periodo of periodos) {
			const inicio = new Date(periodo.inicio);
			const fim = new Date(periodo.fim);

			if (dataAtual >= inicio && dataAtual <= fim) {
				// Estamos dentro do período do semestre
				return { ano: periodo.ano, semestre: periodo.semestre };
			}
		}

		// Se não estamos em nenhum período ativo, aplicar regras de intervalo
		// Encontrar o próximo período futuro
		const proximoPeriodo = periodos.find(
			(p) => new Date(p.inicio) > dataAtual,
		);

		if (proximoPeriodo) {
			const inicioProximo = new Date(proximoPeriodo.inicio);
			const diasParaProximo = Math.ceil(
				(inicioProximo - dataAtual) / (1000 * 60 * 60 * 24),
			);

			if (diasParaProximo <= 10) {
				// Menos de 10 dias para o próximo semestre - retornar o próximo
				return {
					ano: proximoPeriodo.ano,
					semestre: proximoPeriodo.semestre,
				};
			}
		}

		// Se não há próximo período ou estamos a mais de 10 dias dele,
		// retornar o período anterior (mais recente que já terminou)
		const periodosPassados = periodos.filter(
			(p) => new Date(p.fim) < dataAtual,
		);
		if (periodosPassados.length > 0) {
			const ultimoPeriodo = periodosPassados[periodosPassados.length - 1];
			return { ano: ultimoPeriodo.ano, semestre: ultimoPeriodo.semestre };
		}

		// Fallback final
		const anoAtual = dataAtual.getFullYear();
		const semestreAtual = dataAtual.getMonth() < 6 ? 1 : 2;
		return { ano: anoAtual, semestre: semestreAtual };
	} catch (error) {
		console.log("Erro ao calcular ano/semestre atual:", error);
		// Fallback para lógica simples em caso de erro
		const dataAtual = new Date();
		const anoAtual = dataAtual.getFullYear();
		const semestreAtual = dataAtual.getMonth() < 6 ? 1 : 2;
		return { ano: anoAtual, semestre: semestreAtual };
	}
};

module.exports = {
	obterAnoSemestreAtual,
	listarTodosAnoSemestres,
};

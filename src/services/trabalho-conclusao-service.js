const trabalhoConclusaoRepository = require("../repository/trabalho-conclusao-repository");
const ofertasTccService = require("./ofertas-tcc-service");

// Função para retornar todos os trabalhos de conclusão
const retornaTodosTrabalhosConlusao = async (req, res) => {
	try {
		const { ano, semestre, id_curso, fase, matricula, etapa } = req.query;
		const filtros = { ano, semestre, id_curso, fase, matricula, etapa };

		const trabalhos =
			await trabalhoConclusaoRepository.obterTodosTrabalhosConclusao(
				filtros,
			);
		res.status(200).json({ trabalhos: trabalhos });
	} catch (error) {
		console.log("Erro ao buscar trabalhos de conclusão:", error);
		res.sendStatus(500);
	}
};

// Função para buscar trabalho específico por ID
const retornaTrabalhoConlusaoPorId = async (req, res) => {
	try {
		const { id } = req.params;

		const trabalho =
			await trabalhoConclusaoRepository.obterTrabalhoConclusaoPorId(id);

		if (!trabalho) {
			return res
				.status(404)
				.json({ message: "Trabalho de conclusão não encontrado" });
		}

		res.status(200).json({ trabalho: trabalho });
	} catch (error) {
		console.log("Erro ao buscar trabalho de conclusão:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo trabalho de conclusão
const criaTrabalhoConlusao = async (req, res) => {
	const dadosTrabalho = req.body; // Usar req.body diretamente

	try {
		const trabalho =
			await trabalhoConclusaoRepository.criarTrabalhoConclusao(dadosTrabalho);

		res.status(201).json({
			message: "Trabalho de conclusão criado com sucesso",
			id: trabalho.id,
		});
	} catch (error) {
		console.log("Erro ao criar trabalho de conclusão:", error);
		console.log("Dados que causaram erro:", dadosTrabalho);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar um trabalho de conclusão
const atualizaTrabalhoConlusao = async (req, res) => {
	const { id } = req.params;
	const dadosAtualizados = req.body; // Usar req.body diretamente
	console.log("Dados recebidos:", req.body);

	try {
		const sucesso =
			await trabalhoConclusaoRepository.atualizarTrabalhoConclusao(
				id,
				dadosAtualizados,
			);

		if (sucesso) {
			res.status(200).json({
				message: "Trabalho de conclusão atualizado com sucesso",
			});
		} else {
			res.status(404).json({
				message: "Trabalho de conclusão não encontrado",
			});
		}
	} catch (error) {
		console.log("Erro ao atualizar trabalho de conclusão:", error);
		console.log("Dados que causaram erro:", dadosAtualizados);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar um trabalho de conclusão
const deletaTrabalhoConlusao = async (req, res) => {
	try {
		const { id } = req.params;

		const sucesso =
			await trabalhoConclusaoRepository.deletarTrabalhoConclusao(id);

		if (sucesso) {
			res.status(200).json({
				message: "Trabalho de conclusão deletado com sucesso",
			});
		} else {
			res.status(404).json({
				message: "Trabalho de conclusão não encontrado",
			});
		}
	} catch (error) {
		console.error("Erro ao deletar trabalho de conclusão:", error);
		res.status(500).json({
			message: "Erro ao deletar trabalho de conclusão",
		});
	}
};

// Função para atualizar etapa do trabalho
const atualizaEtapaTrabalho = async (req, res) => {
	const { id } = req.params;
	const { etapa } = req.body;

	try {
		const sucesso =
			await trabalhoConclusaoRepository.atualizarEtapaTrabalho(id, etapa);

		if (sucesso) {
			res.status(200).json({ message: "Etapa atualizada com sucesso" });
		} else {
			res.status(404).json({
				message: "Trabalho de conclusão não encontrado",
			});
		}
	} catch (error) {
		console.log("Erro ao atualizar etapa:", error);
		res.status(500).json({ error: error.message });
	}
};

// Métodos para o TccStepper
const buscarPorDiscente = async (matricula) => {
	try {
		// Primeiro, buscar a última oferta TCC
		const ultimaOferta = await ofertasTccService.buscarUltimaOfertaTcc();

		if (!ultimaOferta) {
			throw new Error("Nenhuma oferta TCC encontrada no sistema");
		}

		// Buscar trabalho de conclusão para o discente na última oferta
		const trabalho =
			await trabalhoConclusaoRepository.buscarPorDiscenteEOferta(
				matricula,
				ultimaOferta.ano,
				ultimaOferta.semestre,
				ultimaOferta.id_curso,
				ultimaOferta.fase,
			);

		return trabalho;
	} catch (error) {
		console.error("Erro ao buscar trabalho por discente:", error);
		throw error;
	}
};

const criar = async (dadosTcc) => {
	try {
		// Se não foram fornecidos ano/semestre/curso/fase, buscar da última oferta
		if (
			!dadosTcc.ano ||
			!dadosTcc.semestre ||
			!dadosTcc.id_curso ||
			!dadosTcc.fase
		) {
			const ultimaOferta =
				await ofertasTccService.buscarUltimaOfertaTcc();

			if (!ultimaOferta) {
				throw new Error("Nenhuma oferta TCC encontrada no sistema");
			}

			dadosTcc.ano = ultimaOferta.ano;
			dadosTcc.semestre = ultimaOferta.semestre;
			dadosTcc.id_curso = ultimaOferta.id_curso;
			dadosTcc.fase = ultimaOferta.fase;
		}

		const trabalho =
			await trabalhoConclusaoRepository.criarTrabalhoConclusao(dadosTcc);
		return trabalho;
	} catch (error) {
		console.error("Erro ao criar trabalho de conclusão:", error);
		throw error;
	}
};

const atualizar = async (id, dadosAtualizados) => {
	try {
		const sucesso =
			await trabalhoConclusaoRepository.atualizarTrabalhoConclusao(
				id,
				dadosAtualizados,
			);
		if (sucesso) {
			return await trabalhoConclusaoRepository.obterTrabalhoConclusaoPorId(
				id,
			);
		}
		return null;
	} catch (error) {
		console.error("Erro ao atualizar trabalho de conclusão:", error);
		throw error;
	}
};

const buscarPorId = async (id) => {
	try {
		const trabalho =
			await trabalhoConclusaoRepository.obterTrabalhoConclusaoPorId(id);
		return trabalho;
	} catch (error) {
		console.error("Erro ao buscar trabalho por ID:", error);
		throw error;
	}
};

module.exports = {
	retornaTodosTrabalhosConlusao,
	retornaTrabalhoConlusaoPorId,
	criaTrabalhoConlusao,
	atualizaTrabalhoConlusao,
	deletaTrabalhoConlusao,
	atualizaEtapaTrabalho,
	buscarPorDiscente,
	criar,
	atualizar,
	buscarPorId,
};

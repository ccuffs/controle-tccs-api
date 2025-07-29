const trabalhoConclusaoRepository = require("../repository/trabalho-conclusao-repository");

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
	const formData = req.body.formData;

	try {
		const trabalho =
			await trabalhoConclusaoRepository.criarTrabalhoConclusao(formData);

		res.status(201).json({
			message: "Trabalho de conclusão criado com sucesso",
			id: trabalho.id,
		});
	} catch (error) {
		console.log("Erro ao criar trabalho de conclusão:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar um trabalho de conclusão
const atualizaTrabalhoConlusao = async (req, res) => {
	const { id } = req.params;
	const formData = req.body.formData;

	try {
		const sucesso =
			await trabalhoConclusaoRepository.atualizarTrabalhoConclusao(
				id,
				formData,
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
		console.log("Dados que causaram erro:", formData);
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

module.exports = {
	retornaTodosTrabalhosConlusao,
	retornaTrabalhoConlusaoPorId,
	criaTrabalhoConlusao,
	atualizaTrabalhoConlusao,
	deletaTrabalhoConlusao,
	atualizaEtapaTrabalho,
};

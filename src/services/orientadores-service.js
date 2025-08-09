const orientadorRepository = require("../repository/orientador-repository");

// Listar todas as orientações
const retornaTodasOrientacoes = async (req, res) => {
	try {
		const orientacoes = await orientadorRepository.obterTodasOrientacoes();
		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações:", error);
		res.sendStatus(500);
	}
};

// Listar orientações por docente
const retornaOrientacoesPorDocente = async (req, res) => {
	try {
		const codigo = req.params.codigo;
		const orientacoes =
			await orientadorRepository.obterOrientacoesPorDocente(codigo);
		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações do docente:", error);
		res.sendStatus(500);
	}
};

// Listar orientações por curso
const retornaOrientacoesPorCurso = async (req, res) => {
	try {
		const id = req.params.id;
		const orientacoes =
			await orientadorRepository.obterOrientacoesPorCurso(id);
		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações do curso:", error);
		res.sendStatus(500);
	}
};

// Adicionar nova orientação
const criaOrientacao = async (req, res) => {
	const formData = req.body.formData;
	try {
		const orientacao = await orientadorRepository.criarOrientacao(formData);
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar orientação:", error);
		res.sendStatus(500);
	}
};

// Remover orientação
const deletaOrientacao = async (req, res) => {
	try {
		const { id_curso, codigo_docente } = req.params;
		const sucesso = await orientadorRepository.deletarOrientacao(
			id_curso,
			codigo_docente,
		);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Orientação não encontrada" });
		}
	} catch (error) {
		console.error("Erro ao deletar orientação:", error);
		res.status(500).send({ message: "Erro ao deletar orientação" });
	}
};

module.exports = {
	retornaTodasOrientacoes,
	retornaOrientacoesPorDocente,
	retornaOrientacoesPorCurso,
	criaOrientacao,
	deletaOrientacao,
};

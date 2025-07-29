const docenteRepository = require("../repository/docente-repository");

// Função para retornar todos os docentes
const retornaTodosDocentes = async (req, res) => {
	try {
		const docentes = await docenteRepository.obterTodosDocentes();
		res.status(200).json({ docentes: docentes });
	} catch (error) {
		console.log("Erro ao buscar docentes:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo docente
const criaDocente = async (req, res) => {
	const formData = req.body.formData;
	try {
		const docente = await docenteRepository.criarDocente(formData);
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar docente:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar um docente
const atualizaDocente = async (req, res) => {
	const formData = req.body.formData;
	try {
		const sucesso = await docenteRepository.atualizarDocente(
			formData.codigo,
			formData,
		);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Docente não encontrado" });
		}
	} catch (error) {
		console.log("Erro ao atualizar docente:", error);
		res.sendStatus(500);
	}
};

// Função para deletar um docente
const deletaDocente = async (req, res) => {
	try {
		const codigo = req.params.codigo;
		const sucesso = await docenteRepository.deletarDocente(codigo);

		if (sucesso) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Docente não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar docente:", error);
		res.status(500).send({ message: "Erro ao deletar docente" });
	}
};

module.exports = {
	retornaTodosDocentes,
	criaDocente,
	atualizaDocente,
	deletaDocente,
};

const model = require("@backend/models");

// Função para retornar todos os docentes
const retornaTodosDocentes = async (req, res) => {
	try {
		const profs = await model.Docente.findAll({ order: [["nome", "ASC"]] });
		res.status(200).json({ docentes: profs });
	} catch (error) {
		console.log("Erro ao buscar docentes:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo docente
const criaDocente = async (req, res) => {
	const formData = req.body.formData;
	try {
		const prof = model.Docente.build(formData);
		await prof.save();
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
		await model.Docente.update(formData, {
			where: { codigo: formData.codigo },
		});
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao atualizar docente:", error);
		res.sendStatus(500);
	}
};

// Função para deletar um docente
const deletaDocente = async (req, res) => {
	try {
		const codigo = req.params.codigo;
		const deleted = await model.Docente.destroy({
			where: { codigo: codigo },
		});

		if (deleted) {
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
	deletaDocente
};
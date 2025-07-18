const model = require("@backend/models");

// Função para retornar todos os dicentes
const retornaTodosDicentes = async (req, res) => {
	try {
		const dicentes = await model.dicente.findAll();
		res.status(200).json({ dicentes: dicentes });
	} catch (error) {
		console.log("Erro ao buscar dicentes:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo dicente
const criaDicente = async (req, res) => {
	const formData = req.body.formData;
	try {
		const dicente = model.dicente.build(formData);
		await dicente.save();
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar dicente:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar um dicente
const atualizaDicente = async (req, res) => {
	const formData = req.body.formData;
	try {
		await model.dicente.update(formData, { where: { matricula: formData.matricula } });
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao atualizar dicente:", error);
		res.sendStatus(500);
	}
};

// Função para deletar um dicente
const deletaDicente = async (req, res) => {
	try {
		const matricula = req.params.matricula;
		const deleted = await model.dicente.destroy({
			where: { matricula: matricula },
		});

		if (deleted) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Dicente não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar dicente:", error);
		res.status(500).send({ message: "Erro ao deletar dicente" });
	}
};

module.exports = {
	retornaTodosDicentes,
	criaDicente,
	atualizaDicente,
	deletaDicente
};
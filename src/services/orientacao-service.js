const model = require("@backend/models");

// Função para retornar todas as orientações
const retornaTodasOrientacoes = async (req, res) => {
	try {
		const orientacoes = await model.Orientacao.findAll();
		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações:", error);
		res.sendStatus(500);
	}
};

// Função para criar uma nova orientação
const criaOrientacao = async (req, res) => {
	const formData = req.body.formData;
	try {
		const orientacao = model.Orientacao.build(formData);
		await orientacao.save();
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar orientação:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar uma orientação
const atualizaOrientacao = async (req, res) => {
	const formData = req.body.formData;
	try {
		await model.Orientacao.update(formData, { where: { codigo: formData.codigo, matricula: formData.matricula } });
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao atualizar orientação:", error);
		res.sendStatus(500);
	}
};

// Função para deletar uma orientação
const deletaOrientacao = async (req, res) => {
	try {
		const { codigo, matricula } = req.params;
		const deleted = await model.Orientacao.destroy({
			where: { codigo: codigo, matricula: matricula },
		});

		if (deleted) {
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
	criaOrientacao,
	atualizaOrientacao,
	deletaOrientacao
};
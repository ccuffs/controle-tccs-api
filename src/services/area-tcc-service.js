const model = require("@backend/models");

// Função para retornar todas as áreas TCC
const retornaTodasAreasTcc = async (req, res) => {
	try {
		const areas = await model.AreaTcc.findAll({
			include: [
				{
					model: model.Docente,
					attributes: ['codigo', 'nome', 'email']
				}
			],
			order: [["descicao", "ASC"]]
		});
		res.status(200).json({ areas: areas });
	} catch (error) {
		console.log("Erro ao buscar áreas TCC:", error);
		res.sendStatus(500);
	}
};

// Função para retornar áreas TCC por docente
const retornaAreasTccPorDocente = async (req, res) => {
	try {
		const codigo = req.params.codigo;
		const areas = await model.AreaTcc.findAll({
			where: { codigo_docente: codigo },
			order: [["descicao", "ASC"]]
		});
		res.status(200).json({ areas: areas });
	} catch (error) {
		console.log("Erro ao buscar áreas TCC do docente:", error);
		res.sendStatus(500);
	}
};

// Função para criar uma nova área TCC
const criaAreaTcc = async (req, res) => {
	const formData = req.body.formData;
	try {
		const area = model.AreaTcc.build(formData);
		await area.save();
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao criar área TCC:", error);
		res.sendStatus(500);
	}
};

// Função para atualizar uma área TCC
const atualizaAreaTcc = async (req, res) => {
	const formData = req.body.formData;
	try {
		await model.AreaTcc.update(formData, {
			where: { id: formData.id },
		});
		res.sendStatus(200);
	} catch (error) {
		console.log("Erro ao atualizar área TCC:", error);
		res.sendStatus(500);
	}
};

// Função para deletar uma área TCC
const deletaAreaTcc = async (req, res) => {
	try {
		const id = req.params.id;
		const deleted = await model.AreaTcc.destroy({
			where: { id: id },
		});

		if (deleted) {
			res.sendStatus(200);
		} else {
			res.status(404).send({ message: "Área TCC não encontrada" });
		}
	} catch (error) {
		console.error("Erro ao deletar área TCC:", error);
		res.status(500).send({ message: "Erro ao deletar área TCC" });
	}
};

module.exports = {
	retornaTodasAreasTcc,
	retornaAreasTccPorDocente,
	criaAreaTcc,
	atualizaAreaTcc,
	deletaAreaTcc
};
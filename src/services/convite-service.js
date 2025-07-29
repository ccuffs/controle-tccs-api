const model = require("../models");

// Função para retornar todos os convites
const retornaTodosConvites = async (req, res) => {
	try {
		const { id_tcc, codigo_docente, aceito } = req.query;

		let whereClause = {};

		// Aplicar filtros se fornecidos
		if (id_tcc) whereClause.id = parseInt(id_tcc);
		if (codigo_docente) whereClause.codigo_docente = codigo_docente;
		if (aceito !== undefined) whereClause.aceito = aceito === "true";

		const convites = await model.Convite.findAll({
			where: whereClause,
			include: [
				{
					model: model.TrabalhoConclusao,
					include: [
						{
							model: model.Dicente,
							attributes: ["matricula", "nome", "email"],
						},
						{
							model: model.Curso,
							attributes: ["id", "nome", "codigo"],
						},
					],
				},
				{
					model: model.Docente,
					attributes: ["codigo", "nome", "email"],
				},
			],
			order: [["data_envio", "DESC"]],
		});

		res.status(200).json({ convites: convites });
	} catch (error) {
		console.log("Erro ao buscar convites:", error);
		res.sendStatus(500);
	}
};

// Função para criar um novo convite
const criaConvite = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se já existe convite para este TCC e docente
		const conviteExistente = await model.Convite.findOne({
			where: {
				id: formData.id,
				codigo_docente: formData.codigo_docente,
			},
		});

		if (conviteExistente) {
			return res.status(400).json({
				message: "Já existe um convite para este docente neste TCC",
			});
		}

		// Adicionar data de envio atual
		formData.data_envio = new Date();

		const convite = model.Convite.build(formData);
		await convite.save();

		res.status(201).json({
			message: "Convite criado com sucesso",
		});
	} catch (error) {
		console.log("Erro ao criar convite:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para aceitar/rejeitar um convite
const respondeConvite = async (req, res) => {
	const { id, codigo_docente } = req.params;
	const { aceito } = req.body;

	try {
		const updateData = { aceito: aceito };

		// Se foi aceito, adicionar data de aceite
		if (aceito) {
			updateData.data_aceite = new Date();
		}

		const [updatedRowsCount] = await model.Convite.update(updateData, {
			where: {
				id: id,
				codigo_docente: codigo_docente,
			},
		});

		if (updatedRowsCount === 0) {
			return res.status(404).json({ message: "Convite não encontrado" });
		}

		res.status(200).json({
			message: aceito
				? "Convite aceito com sucesso"
				: "Convite rejeitado",
		});
	} catch (error) {
		console.log("Erro ao responder convite:", error);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar um convite
const deletaConvite = async (req, res) => {
	try {
		const { id, codigo_docente } = req.params;

		const deleted = await model.Convite.destroy({
			where: {
				id: id,
				codigo_docente: codigo_docente,
			},
		});

		if (deleted) {
			res.status(200).json({ message: "Convite deletado com sucesso" });
		} else {
			res.status(404).json({ message: "Convite não encontrado" });
		}
	} catch (error) {
		console.error("Erro ao deletar convite:", error);
		res.status(500).json({ message: "Erro ao deletar convite" });
	}
};

// Função para buscar convites pendentes de um docente
const retornaConvitesPendentesDocente = async (req, res) => {
	try {
		const { codigo_docente } = req.params;

		const convites = await model.Convite.findAll({
			where: {
				codigo_docente: codigo_docente,
				aceito: false,
				data_aceite: null,
			},
			include: [
				{
					model: model.TrabalhoConclusao,
					include: [
						{
							model: model.Dicente,
							attributes: ["matricula", "nome", "email"],
						},
						{
							model: model.Curso,
							attributes: ["id", "nome", "codigo"],
						},
					],
				},
			],
			order: [["data_envio", "DESC"]],
		});

		res.status(200).json({ convites: convites });
	} catch (error) {
		console.log("Erro ao buscar convites pendentes:", error);
		res.sendStatus(500);
	}
};

module.exports = {
	retornaTodosConvites,
	criaConvite,
	respondeConvite,
	deletaConvite,
	retornaConvitesPendentesDocente,
};

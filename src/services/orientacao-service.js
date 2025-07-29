const model = require("../models");

// Função para retornar todas as orientações
const retornaTodasOrientacoes = async (req, res) => {
	try {
		const { id_tcc, codigo_docente, orientador } = req.query;

		let whereClause = {};

		// Aplicar filtros se fornecidos
		if (id_tcc) whereClause.id_tcc = parseInt(id_tcc);
		if (codigo_docente) whereClause.codigo_docente = codigo_docente;
		if (orientador !== undefined)
			whereClause.orientador = orientador === "true";

		const orientacoes = await model.Orientacao.findAll({
			where: whereClause,
			include: [
				{
					model: model.Docente,
					attributes: ["codigo", "nome", "email"],
				},
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
			order: [["id", "DESC"]],
		});

		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações:", error);
		res.sendStatus(500);
	}
};

// Função para buscar orientações de um TCC específico
const retornaOrientacoesPorTcc = async (req, res) => {
	try {
		const { id_tcc } = req.params;

		const orientacoes = await model.Orientacao.findAll({
			where: { id_tcc: id_tcc },
			include: [
				{
					model: model.Docente,
					attributes: ["codigo", "nome", "email"],
				},
			],
			order: [
				["orientador", "DESC"],
				["id", "ASC"],
			],
		});

		res.status(200).json({ orientacoes: orientacoes });
	} catch (error) {
		console.log("Erro ao buscar orientações do TCC:", error);
		res.sendStatus(500);
	}
};

// Função para criar uma nova orientação
const criaOrientacao = async (req, res) => {
	const formData = req.body.formData;

	try {
		// Verificar se já existe orientação deste docente para este TCC
		const orientacaoExistente = await model.Orientacao.findOne({
			where: {
				codigo_docente: formData.codigo_docente,
				id_tcc: formData.id_tcc,
			},
		});

		if (orientacaoExistente) {
			return res.status(400).json({
				message: "Este docente já possui orientação para este TCC",
			});
		}

		// Se está marcando como orientador, verificar se já existe um orientador
		if (formData.orientador) {
			const orientadorExistente = await model.Orientacao.findOne({
				where: {
					id_tcc: formData.id_tcc,
					orientador: true,
				},
			});

			if (orientadorExistente) {
				return res.status(400).json({
					message: "Este TCC já possui um orientador principal",
				});
			}
		}

		const orientacao = model.Orientacao.build(formData);
		await orientacao.save();

		res.status(201).json({
			message: "Orientação criada com sucesso",
			id: orientacao.id,
		});
	} catch (error) {
		console.log("Erro ao criar orientação:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para atualizar uma orientação
const atualizaOrientacao = async (req, res) => {
	const { id } = req.params;
	const formData = req.body.formData;

	try {
		// Se está alterando para orientador, verificar se já existe outro orientador
		if (formData.orientador) {
			const orientacaoAtual = await model.Orientacao.findByPk(id);
			if (!orientacaoAtual) {
				return res
					.status(404)
					.json({ message: "Orientação não encontrada" });
			}

			if (!orientacaoAtual.orientador) {
				// Se não era orientador antes
				const orientadorExistente = await model.Orientacao.findOne({
					where: {
						id_tcc: orientacaoAtual.id_tcc,
						orientador: true,
						id: { [model.Sequelize.Op.ne]: id }, // Diferente da atual
					},
				});

				if (orientadorExistente) {
					return res.status(400).json({
						message: "Este TCC já possui um orientador principal",
					});
				}
			}
		}

		const [updatedRowsCount] = await model.Orientacao.update(formData, {
			where: { id: id },
		});

		if (updatedRowsCount === 0) {
			return res
				.status(404)
				.json({ message: "Orientação não encontrada" });
		}

		res.status(200).json({ message: "Orientação atualizada com sucesso" });
	} catch (error) {
		console.log("Erro ao atualizar orientação:", error);
		console.log("Dados que causaram erro:", formData);
		res.status(500).json({ error: error.message });
	}
};

// Função para deletar uma orientação
const deletaOrientacao = async (req, res) => {
	try {
		const { id } = req.params;

		const deleted = await model.Orientacao.destroy({
			where: { id: id },
		});

		if (deleted) {
			res.status(200).json({
				message: "Orientação deletada com sucesso",
			});
		} else {
			res.status(404).json({ message: "Orientação não encontrada" });
		}
	} catch (error) {
		console.error("Erro ao deletar orientação:", error);
		res.status(500).json({ message: "Erro ao deletar orientação" });
	}
};

module.exports = {
	retornaTodasOrientacoes,
	retornaOrientacoesPorTcc,
	criaOrientacao,
	atualizaOrientacao,
	deletaOrientacao,
};

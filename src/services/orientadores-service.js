const model = require("@backend/models");

// Listar todas as orientações
const retornaTodasOrientacoes = async (req, res) => {
	try {
		const orientacoes = await model.OrientadorCurso.findAll({
			include: [
				{
					model: model.Docente,
					as: "docente",
					attributes: ["codigo", "nome", "email"],
				},
				{
					model: model.Curso,
					as: "curso",
					attributes: ["id", "nome", "codigo", "turno"],
				},
			],
			order: [[{ model: model.Docente, as: "docente" }, "nome", "ASC"]],
		});
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
		const orientacoes = await model.OrientadorCurso.findAll({
			where: { codigo_docente: codigo },
			include: [
				{
					model: model.Curso,
					as: "curso",
					attributes: ["id", "nome", "codigo", "turno"],
				},
			],
			order: [[{ model: model.Curso, as: "curso" }, "nome", "ASC"]],
		});
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
		const orientacoes = await model.OrientadorCurso.findAll({
			where: { id_curso: id },
			include: [
				{
					model: model.Docente,
					as: "docente",
					attributes: ["codigo", "nome", "email"],
				},
			],
			order: [[{ model: model.Docente, as: "docente" }, "nome", "ASC"]],
		});
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
		const orientacao = model.OrientadorCurso.build(formData);
		await orientacao.save();
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
		const deleted = await model.OrientadorCurso.destroy({
			where: {
				id_curso: id_curso,
				codigo_docente: codigo_docente,
			},
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
	retornaOrientacoesPorDocente,
	retornaOrientacoesPorCurso,
	criaOrientacao,
	deletaOrientacao,
};

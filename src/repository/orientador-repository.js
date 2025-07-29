const model = require("@backend/models");
const orientadorRepository = {};

// Buscar todas as orientações com docente e curso
orientadorRepository.obterTodasOrientacoes = async () => {
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
	return orientacoes;
};

// Buscar orientações por docente
orientadorRepository.obterOrientacoesPorDocente = async (codigoDocente) => {
	const orientacoes = await model.OrientadorCurso.findAll({
		where: { codigo_docente: codigoDocente },
		include: [
			{
				model: model.Curso,
				as: "curso",
				attributes: ["id", "nome", "codigo", "turno"],
			},
		],
		order: [[{ model: model.Curso, as: "curso" }, "nome", "ASC"]],
	});
	return orientacoes;
};

// Buscar orientações por curso
orientadorRepository.obterOrientacoesPorCurso = async (idCurso) => {
	const orientacoes = await model.OrientadorCurso.findAll({
		where: { id_curso: idCurso },
		include: [
			{
				model: model.Docente,
				as: "docente",
				attributes: ["codigo", "nome", "email"],
			},
		],
		order: [[{ model: model.Docente, as: "docente" }, "nome", "ASC"]],
	});
	return orientacoes;
};

// Criar nova orientação
orientadorRepository.criarOrientacao = async (dadosOrientacao) => {
	const orientacao = model.OrientadorCurso.build(dadosOrientacao);
	await orientacao.save();
	return orientacao;
};

// Deletar orientação
orientadorRepository.deletarOrientacao = async (idCurso, codigoDocente) => {
	const deleted = await model.OrientadorCurso.destroy({
		where: {
			id_curso: idCurso,
			codigo_docente: codigoDocente,
		},
	});
	return deleted > 0;
};

module.exports = orientadorRepository;

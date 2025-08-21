const model = require("@backend/models");
const bancaCursoRepository = {};

// Buscar todos os docentes de banca por curso
bancaCursoRepository.obterDocentesBancaPorCurso = async (idCurso) => {
	const docentesBanca = await model.BancaCurso.findAll({
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
	return docentesBanca;
};

// Buscar cursos por docente de banca
bancaCursoRepository.obterCursosPorDocenteBanca = async (codigoDocente) => {
	const cursos = await model.BancaCurso.findAll({
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
	return cursos;
};

// Verificar se um docente pode participar de banca em um curso
bancaCursoRepository.verificarDocenteBanca = async (idCurso, codigoDocente) => {
	const bancaCurso = await model.BancaCurso.findOne({
		where: {
			id_curso: idCurso,
			codigo_docente: codigoDocente,
		},
	});
	return !!bancaCurso;
};

module.exports = bancaCursoRepository;

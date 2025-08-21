const bancaCursoRepository = require("../repository/banca-curso-repository");

// Listar docentes de banca por curso
const retornaDocentesBancaPorCurso = async (req, res) => {
	try {
		const id = req.params.id;
		const docentesBanca =
			await bancaCursoRepository.obterDocentesBancaPorCurso(id);
		res.status(200).json({ docentesBanca: docentesBanca });
	} catch (error) {
		console.log("Erro ao buscar docentes de banca do curso:", error);
		res.sendStatus(500);
	}
};

// Listar cursos por docente de banca
const retornaCursosPorDocenteBanca = async (req, res) => {
	try {
		const codigo = req.params.codigo;
		const cursos =
			await bancaCursoRepository.obterCursosPorDocenteBanca(codigo);
		res.status(200).json({ cursos: cursos });
	} catch (error) {
		console.log("Erro ao buscar cursos do docente de banca:", error);
		res.sendStatus(500);
	}
};

// Verificar se docente pode participar de banca
const verificarDocenteBanca = async (req, res) => {
	try {
		const { idCurso, codigoDocente } = req.params;
		const podeParticipar = await bancaCursoRepository.verificarDocenteBanca(
			idCurso,
			codigoDocente,
		);
		res.status(200).json({ podeParticipar: podeParticipar });
	} catch (error) {
		console.log("Erro ao verificar docente de banca:", error);
		res.sendStatus(500);
	}
};

module.exports = {
	retornaDocentesBancaPorCurso,
	retornaCursosPorDocenteBanca,
	verificarDocenteBanca,
};

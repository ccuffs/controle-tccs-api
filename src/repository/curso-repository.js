const model = require("@backend/models");
const cursoRepository = {};

// Buscar todos os cursos
cursoRepository.obterTodosCursos = async () => {
	const cursos = await model.Curso.findAll();
	return cursos;
};

// Buscar curso por ID
cursoRepository.obterCursoPorId = async (id) => {
	const curso = await model.Curso.findByPk(id);
	return curso;
};

// Criar novo curso
cursoRepository.criarCurso = async (dadosCurso) => {
	const curso = model.Curso.build(dadosCurso);
	await curso.save();
	return curso;
};

// Atualizar curso
cursoRepository.atualizarCurso = async (id, dadosCurso) => {
	const [linhasAfetadas] = await model.Curso.update(dadosCurso, {
		where: { id: id },
	});
	return linhasAfetadas > 0;
};

// Deletar curso
cursoRepository.deletarCurso = async (id) => {
	const deleted = await model.Curso.destroy({
		where: { id: id },
	});
	return deleted > 0;
};

module.exports = cursoRepository;

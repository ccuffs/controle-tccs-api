const model = require("@backend/models");
const docenteRepository = {};

// Buscar todos os docentes
docenteRepository.obterTodosDocentes = async () => {
	const docentes = await model.Docente.findAll({
		order: [["nome", "ASC"]],
	});
	return docentes;
};

// Buscar docente por código
docenteRepository.obterDocentePorCodigo = async (codigo) => {
	const docente = await model.Docente.findOne({
		where: { codigo: codigo },
	});
	return docente;
};

// Criar novo docente
docenteRepository.criarDocente = async (dadosDocente) => {
	const docente = model.Docente.build(dadosDocente);
	await docente.save();
	return docente;
};

// Atualizar docente
docenteRepository.atualizarDocente = async (codigo, dadosDocente) => {
	const [linhasAfetadas] = await model.Docente.update(dadosDocente, {
		where: { codigo: codigo },
	});
	return linhasAfetadas > 0;
};

// Deletar docente
docenteRepository.deletarDocente = async (codigo) => {
	const deleted = await model.Docente.destroy({
		where: { codigo: codigo },
	});
	return deleted > 0;
};

module.exports = docenteRepository;

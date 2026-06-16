const model = require("@backend/models");
const { Op } = require("sequelize");
const docenteRepository = {};

// Buscar todos os docentes
const DOCENTE_ATTRS = ["codigo", "email", "nome", "sala", "siape", "externo", "instituicao", "id_usuario"];

docenteRepository.obterTodosDocentes = async () => {
	const docentes = await model.Docente.findAll({
		attributes: DOCENTE_ATTRS,
		order: [["nome", "ASC"]],
	});
	return docentes;
};

// Buscar docente por código
docenteRepository.obterDocentePorCodigo = async (codigo) => {
	const docente = await model.Docente.findOne({
		attributes: DOCENTE_ATTRS,
		where: { codigo: codigo },
	});
	return docente;
};

// Buscar docente por email
docenteRepository.obterDocentePorEmail = async (email) => {
	const docente = await model.Docente.findOne({
		attributes: DOCENTE_ATTRS,
		where: { email: email },
	});
	return docente;
};

// Buscar docentes externos por nome (busca parcial, case-insensitive)
docenteRepository.buscarExternosPorNome = async (nome) => {
	const docentes = await model.Docente.findAll({
		attributes: DOCENTE_ATTRS,
		where: {
			externo: true,
			nome: { [Op.iLike]: `%${nome}%` },
		},
		order: [["nome", "ASC"]],
		limit: 10,
	});
	return docentes;
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

// Buscar docente por id_usuario
docenteRepository.obterDocentePorUsuario = async (id_usuario) => {
	const docente = await model.Docente.findOne({
		attributes: DOCENTE_ATTRS,
		where: { id_usuario: id_usuario },
	});
	return docente;
};

module.exports = docenteRepository;

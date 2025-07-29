const model = require("@backend/models");
const orientacaoRepository = {};

// Buscar todas as orientações com filtros
orientacaoRepository.obterTodasOrientacoes = async (filtros) => {
	const { id_tcc, codigo_docente, orientador } = filtros;

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

	return orientacoes;
};

// Buscar orientações por TCC
orientacaoRepository.obterOrientacoesPorTcc = async (idTcc) => {
	const orientacoes = await model.Orientacao.findAll({
		where: { id_tcc: idTcc },
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
	return orientacoes;
};

// Verificar se orientação existe
orientacaoRepository.verificarOrientacaoExiste = async (
	codigoDocente,
	idTcc,
) => {
	const orientacao = await model.Orientacao.findOne({
		where: {
			codigo_docente: codigoDocente,
			id_tcc: idTcc,
		},
	});
	return orientacao !== null;
};

// Verificar se já existe orientador para o TCC
orientacaoRepository.verificarOrientadorExiste = async (idTcc) => {
	const orientador = await model.Orientacao.findOne({
		where: {
			id_tcc: idTcc,
			orientador: true,
		},
	});
	return orientador !== null;
};

// Buscar orientação por ID
orientacaoRepository.obterOrientacaoPorId = async (id) => {
	const orientacao = await model.Orientacao.findByPk(id);
	return orientacao;
};

// Verificar se existe outro orientador (excluindo o atual)
orientacaoRepository.verificarOutroOrientadorExiste = async (
	idTcc,
	idExcluir,
) => {
	const orientador = await model.Orientacao.findOne({
		where: {
			id_tcc: idTcc,
			orientador: true,
			id: { [model.Sequelize.Op.ne]: idExcluir }, // Diferente da atual
		},
	});
	return orientador !== null;
};

// Criar nova orientação
orientacaoRepository.criarOrientacao = async (dadosOrientacao) => {
	const orientacao = model.Orientacao.build(dadosOrientacao);
	await orientacao.save();
	return orientacao;
};

// Atualizar orientação
orientacaoRepository.atualizarOrientacao = async (id, dadosOrientacao) => {
	const [linhasAfetadas] = await model.Orientacao.update(dadosOrientacao, {
		where: { id: id },
	});
	return linhasAfetadas > 0;
};

// Deletar orientação
orientacaoRepository.deletarOrientacao = async (id) => {
	const deleted = await model.Orientacao.destroy({
		where: { id: id },
	});
	return deleted > 0;
};

module.exports = orientacaoRepository;

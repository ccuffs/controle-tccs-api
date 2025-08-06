const model = require("../models");

const datasDefesaRepository = {};

// Buscar todas as datas de defesa com filtros
datasDefesaRepository.obterTodasDatasDefesa = async (filtros) => {
	const { ano, semestre, id_curso, fase } = filtros;

	let whereClause = {};

	// Aplicar filtros se fornecidos
	if (ano) whereClause.ano = parseInt(ano);
	if (semestre) whereClause.semestre = parseInt(semestre);
	if (id_curso) whereClause.id_curso = parseInt(id_curso);
	if (fase) whereClause.fase = parseInt(fase);

	const datasDefesa = await model.DatasDefesaTcc.findAll({
		where: whereClause,
		include: [
			{
				model: model.Curso,
				attributes: ["id", "nome", "codigo"],
			},
		],
		order: [
			["ano", "DESC"],
			["semestre", "DESC"],
			["fase", "ASC"],
		],
	});

	return datasDefesa;
};

// Buscar datas de defesa por oferta específica
datasDefesaRepository.obterDatasDefesaPorOferta = async (ano, semestre, id_curso, fase) => {
	const datasDefesa = await model.DatasDefesaTcc.findOne({
		where: {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
		},
		include: [
			{
				model: model.Curso,
				attributes: ["id", "nome", "codigo"],
			},
		],
	});

	return datasDefesa;
};

// Criar nova data de defesa
datasDefesaRepository.criarDataDefesa = async (dadosDataDefesa) => {
	const dataDefesa = model.DatasDefesaTcc.build(dadosDataDefesa);
	await dataDefesa.save();
	return dataDefesa;
};

// Atualizar data de defesa
datasDefesaRepository.atualizarDataDefesa = async (ano, semestre, id_curso, fase, dadosDataDefesa) => {
	const [linhasAfetadas] = await model.DatasDefesaTcc.update(dadosDataDefesa, {
		where: {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
		},
	});
	return linhasAfetadas > 0;
};

// Deletar data de defesa
datasDefesaRepository.deletarDataDefesa = async (ano, semestre, id_curso, fase) => {
	const deleted = await model.DatasDefesaTcc.destroy({
		where: {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
		},
	});
	return deleted > 0;
};

module.exports = datasDefesaRepository;
const model = require("@backend/models");
const trabalhoConclusaoRepository = {};

// Buscar todos os trabalhos de conclusão com filtros
trabalhoConclusaoRepository.obterTodosTrabalhosConclusao = async (filtros) => {
	const { ano, semestre, id_curso, fase, matricula, etapa } = filtros;

	let whereClause = {};

	// Aplicar filtros se fornecidos
	if (ano) whereClause.ano = parseInt(ano);
	if (semestre) whereClause.semestre = parseInt(semestre);
	if (id_curso) whereClause.id_curso = parseInt(id_curso);
	if (fase) whereClause.fase = parseInt(fase);
	if (matricula) whereClause.matricula = parseInt(matricula);
	if (etapa) whereClause.etapa = parseInt(etapa);

	const trabalhos = await model.TrabalhoConclusao.findAll({
		where: whereClause,
		include: [
			{
				model: model.Dicente,
				attributes: ["matricula", "nome", "email"],
			},
			{
				model: model.Curso,
				attributes: ["id", "nome", "codigo"],
			},
			{
				model: model.Orientacao,
				include: [
					{
						model: model.Docente,
						attributes: ["codigo", "nome", "email"],
					},
				],
			},
			{
				model: model.Defesa,
				required: false,
			},
		],
		order: [
			["ano", "DESC"],
			["semestre", "DESC"],
			["id", "DESC"],
		],
	});

	return trabalhos;
};

// Buscar trabalho de conclusão por ID
trabalhoConclusaoRepository.obterTrabalhoConclusaoPorId = async (id) => {
	const trabalho = await model.TrabalhoConclusao.findByPk(id, {
		include: [
			{
				model: model.Dicente,
				attributes: ["matricula", "nome", "email"],
			},
			{
				model: model.Curso,
				attributes: ["id", "nome", "codigo"],
			},
			{
				model: model.Orientacao,
				include: [
					{
						model: model.Docente,
						attributes: ["codigo", "nome", "email"],
					},
				],
			},
			{
				model: model.Convite,
			},
			{
				model: model.Defesa,
				include: [
					{
						model: model.Docente,
						as: "membroBancaA",
						attributes: ["codigo", "nome", "email"],
					},
					{
						model: model.Docente,
						as: "membroBancaB",
						attributes: ["codigo", "nome", "email"],
					},
				],
			},
		],
	});
	return trabalho;
};

// Buscar trabalho de conclusão por discente (matrícula) - mais recente
trabalhoConclusaoRepository.buscarPorDiscente = async (matricula) => {
	const trabalho = await model.TrabalhoConclusao.findOne({
		where: { matricula: parseInt(matricula) },
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
		order: [
			["ano", "DESC"],
			["semestre", "DESC"],
			["fase", "ASC"],
			["id", "DESC"],
		],
	});
	return trabalho;
};

// Buscar trabalho de conclusão por discente e oferta específica
trabalhoConclusaoRepository.buscarPorDiscenteEOferta = async (matricula, ano, semestre, id_curso, fase) => {
	const trabalho = await model.TrabalhoConclusao.findOne({
		where: { 
			matricula: parseInt(matricula),
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase)
		},
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
	});
	return trabalho;
};

// Criar novo trabalho de conclusão
trabalhoConclusaoRepository.criarTrabalhoConclusao = async (dadosTrabalho) => {
	const trabalho = model.TrabalhoConclusao.build(dadosTrabalho);
	await trabalho.save();
	return trabalho;
};

// Atualizar trabalho de conclusão
trabalhoConclusaoRepository.atualizarTrabalhoConclusao = async (
	id,
	dadosTrabalho,
) => {
	const [linhasAfetadas] = await model.TrabalhoConclusao.update(
		dadosTrabalho,
		{
			where: { id: id },
		},
	);
	return linhasAfetadas > 0;
};

// Atualizar etapa do trabalho
trabalhoConclusaoRepository.atualizarEtapaTrabalho = async (id, etapa) => {
	const [linhasAfetadas] = await model.TrabalhoConclusao.update(
		{ etapa: etapa },
		{ where: { id: id } },
	);
	return linhasAfetadas > 0;
};

// Deletar trabalho de conclusão
trabalhoConclusaoRepository.deletarTrabalhoConclusao = async (id) => {
	const deleted = await model.TrabalhoConclusao.destroy({
		where: { id: id },
	});
	return deleted > 0;
};

module.exports = trabalhoConclusaoRepository;

const model = require("@backend/models");
const defesaRepository = {};

// Buscar todas as defesas com filtros
defesaRepository.obterTodasDefesas = async (filtros) => {
	const { id_tcc, ano, semestre } = filtros;

	let whereClause = {};
	let includeWhere = {};

	// Filtro direto na defesa
	if (id_tcc) whereClause.id_tcc = parseInt(id_tcc);

	// Filtros no TrabalhoConclusao
	if (ano) includeWhere.ano = parseInt(ano);
	if (semestre) includeWhere.semestre = parseInt(semestre);

	const defesas = await model.Defesa.findAll({
		where: whereClause,
		include: [
			{
				model: model.TrabalhoConclusao,
				where:
					Object.keys(includeWhere).length > 0
						? includeWhere
						: undefined,
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
			{
				model: model.Docente,
				as: "membroBanca",
				attributes: ["codigo", "nome", "email"],
			},
		],
		order: [["data_defesa", "DESC"]],
	});

	return defesas;
};

// Buscar defesas por TCC (todas as defesas do TCC)
defesaRepository.obterDefesasPorTcc = async (idTcc) => {
	const defesas = await model.Defesa.findAll({
		where: { id_tcc: idTcc },
		include: [
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
			{
				model: model.Docente,
				as: "membroBanca",
				attributes: ["codigo", "nome", "email"],
			},
		],
		order: [["membro_banca", "ASC"]],
	});
	return defesas;
};

// Verificar se defesa existe para um TCC e membro específico
defesaRepository.verificarDefesaExiste = async (idTcc, membroBanca = null) => {
	let whereClause = { id_tcc: idTcc };

	// Se informado membro específico, verificar para esse membro
	if (membroBanca) {
		whereClause.membro_banca = membroBanca;
	}

	const defesa = await model.Defesa.findOne({
		where: whereClause,
	});
	return defesa !== null;
};

// Criar nova defesa
defesaRepository.criarDefesa = async (dadosDefesa) => {
	const defesa = model.Defesa.build(dadosDefesa);
	await defesa.save();
	return defesa;
};

// Atualizar defesa
defesaRepository.atualizarDefesa = async (idTcc, membroBanca, dadosDefesa) => {
	const [linhasAfetadas] = await model.Defesa.update(dadosDefesa, {
		where: {
			id_tcc: idTcc,
			membro_banca: membroBanca,
		},
	});
	return linhasAfetadas > 0;
};

// Registrar avaliação da defesa
defesaRepository.registrarAvaliacaoDefesa = async (idTcc, avaliacao) => {
	const [linhasAfetadas] = await model.Defesa.update(
		{ avaliacao: avaliacao },
		{ where: { id_tcc: idTcc } },
	);
	return linhasAfetadas > 0;
};

// Deletar defesa
defesaRepository.deletarDefesa = async (idTcc, membroBanca) => {
	const deleted = await model.Defesa.destroy({
		where: {
			id_tcc: idTcc,
			membro_banca: membroBanca,
		},
	});
	return deleted > 0;
};

module.exports = defesaRepository;

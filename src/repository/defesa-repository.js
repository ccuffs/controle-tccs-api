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
				as: "membroBancaA",
				attributes: ["codigo", "nome", "email"],
			},
			{
				model: model.Docente,
				as: "membroBancaB",
				attributes: ["codigo", "nome", "email"],
			},
		],
		order: [["data_defesa", "DESC"]],
	});

	return defesas;
};

// Buscar defesa por TCC
defesaRepository.obterDefesaPorTcc = async (idTcc) => {
	const defesa = await model.Defesa.findOne({
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
				as: "membroBancaA",
				attributes: ["codigo", "nome", "email"],
			},
			{
				model: model.Docente,
				as: "membroBancaB",
				attributes: ["codigo", "nome", "email"],
			},
		],
	});
	return defesa;
};

// Verificar se defesa existe
defesaRepository.verificarDefesaExiste = async (idTcc) => {
	const defesa = await model.Defesa.findOne({
		where: { id_tcc: idTcc },
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
defesaRepository.atualizarDefesa = async (
	idTcc,
	membroBancaA,
	membroBancaB,
	dadosDefesa,
) => {
	const [linhasAfetadas] = await model.Defesa.update(dadosDefesa, {
		where: {
			id_tcc: idTcc,
			membro_banca_a: membroBancaA,
			membro_banca_b: membroBancaB,
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
defesaRepository.deletarDefesa = async (idTcc, membroBancaA, membroBancaB) => {
	const deleted = await model.Defesa.destroy({
		where: {
			id_tcc: idTcc,
			membro_banca_a: membroBancaA,
			membro_banca_b: membroBancaB,
		},
	});
	return deleted > 0;
};

module.exports = defesaRepository;

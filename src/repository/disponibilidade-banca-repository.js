const model = require("../models");

const disponibilidadeBancaRepository = {};

// Buscar todas as disponibilidades de banca com filtros
disponibilidadeBancaRepository.obterTodasDisponibilidades = async (filtros) => {
	const { ano, semestre, id_curso, fase, codigo_docente, data_defesa } =
		filtros;

	let whereClause = {};

	// Aplicar filtros se fornecidos
	if (ano) whereClause.ano = parseInt(ano);
	if (semestre) whereClause.semestre = parseInt(semestre);
	if (id_curso) whereClause.id_curso = parseInt(id_curso);
	if (fase) whereClause.fase = parseInt(fase);
	if (codigo_docente) whereClause.codigo_docente = codigo_docente;
	if (data_defesa) whereClause.data_defesa = data_defesa;

	const disponibilidades = await model.DocenteDisponibilidadeBanca.findAll({
		where: whereClause,
		include: [
			{
				model: model.Docente,
				attributes: ["codigo", "nome", "email"],
			},
			{
				model: model.Curso,
				attributes: ["id", "nome", "codigo"],
			},
		],
		order: [
			["data_defesa", "ASC"],
			["hora_defesa", "ASC"],
		],
	});

	return disponibilidades;
};

// Buscar disponibilidade específica
disponibilidadeBancaRepository.obterDisponibilidade = async (
	ano,
	semestre,
	id_curso,
	fase,
	codigo_docente,
	data_defesa,
	hora_defesa,
) => {
	const disponibilidade = await model.DocenteDisponibilidadeBanca.findOne({
		where: {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
			codigo_docente: codigo_docente,
			data_defesa: data_defesa,
			hora_defesa: hora_defesa,
		},
		include: [
			{
				model: model.Docente,
				attributes: ["codigo", "nome", "email"],
			},
			{
				model: model.Curso,
				attributes: ["id", "nome", "codigo"],
			},
		],
	});

	return disponibilidade;
};

// Criar nova disponibilidade
disponibilidadeBancaRepository.criarDisponibilidade = async (
	dadosDisponibilidade,
) => {
	const dados = {
		ano: parseInt(dadosDisponibilidade.ano),
		semestre: parseInt(dadosDisponibilidade.semestre),
		id_curso: parseInt(dadosDisponibilidade.id_curso),
		fase: parseInt(dadosDisponibilidade.fase),
		codigo_docente: dadosDisponibilidade.codigo_docente,
		data_defesa: dadosDisponibilidade.data_defesa,
		hora_defesa: dadosDisponibilidade.hora_defesa,
	};

	const disponibilidade = model.DocenteDisponibilidadeBanca.build(dados);
	await disponibilidade.save();
	return disponibilidade;
};

// Atualizar disponibilidade
disponibilidadeBancaRepository.atualizarDisponibilidade = async (
	ano,
	semestre,
	id_curso,
	fase,
	codigo_docente,
	data_defesa,
	hora_defesa,
	dadosDisponibilidade,
) => {
	const [linhasAfetadas] = await model.DocenteDisponibilidadeBanca.update(
		dadosDisponibilidade,
		{
			where: {
				ano: parseInt(ano),
				semestre: parseInt(semestre),
				id_curso: parseInt(id_curso),
				fase: parseInt(fase),
				codigo_docente: codigo_docente,
				data_defesa: data_defesa,
				hora_defesa: hora_defesa,
			},
		},
	);
	return linhasAfetadas > 0;
};

// Criar ou atualizar disponibilidade (upsert)
disponibilidadeBancaRepository.criarOuAtualizarDisponibilidade = async (
	dadosDisponibilidade,
) => {
	const where = {
		ano: parseInt(dadosDisponibilidade.ano),
		semestre: parseInt(dadosDisponibilidade.semestre),
		id_curso: parseInt(dadosDisponibilidade.id_curso),
		fase: parseInt(dadosDisponibilidade.fase),
		codigo_docente: dadosDisponibilidade.codigo_docente,
		data_defesa: dadosDisponibilidade.data_defesa,
		hora_defesa: dadosDisponibilidade.hora_defesa,
	};

	const [disponibilidade] =
		await model.DocenteDisponibilidadeBanca.findOrCreate({
			where,
			defaults: where,
		});

	return disponibilidade;
};

// Deletar disponibilidade
disponibilidadeBancaRepository.deletarDisponibilidade = async (
	ano,
	semestre,
	id_curso,
	fase,
	codigo_docente,
	data_defesa,
	hora_defesa,
) => {
	const deleted = await model.DocenteDisponibilidadeBanca.destroy({
		where: {
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
			codigo_docente: codigo_docente,
			data_defesa: data_defesa,
			hora_defesa: hora_defesa,
		},
	});
	return deleted > 0;
};

// Buscar disponibilidades por docente e oferta
disponibilidadeBancaRepository.obterDisponibilidadesPorDocenteEOferta = async (
	codigo_docente,
	ano,
	semestre,
	id_curso,
	fase,
) => {
	const disponibilidades = await model.DocenteDisponibilidadeBanca.findAll({
		where: {
			codigo_docente: codigo_docente,
			ano: parseInt(ano),
			semestre: parseInt(semestre),
			id_curso: parseInt(id_curso),
			fase: parseInt(fase),
		},
		order: [
			["data_defesa", "ASC"],
			["hora_defesa", "ASC"],
		],
	});

	return disponibilidades;
};

module.exports = disponibilidadeBancaRepository;

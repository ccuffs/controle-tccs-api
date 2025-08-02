const model = require("@backend/models");
const temaTccRepository = {};

// Buscar todos os temas TCC
temaTccRepository.obterTodosTemasTcc = async () => {
	const temas = await model.TemaTcc.findAll({
		include: [
			{
				model: model.AreaTcc,
				required: true,
			},
			{
				model: model.Docente,
				required: true,
			},
		],
	});
	return temas;
};

// Buscar temas TCC por curso
temaTccRepository.obterTemasTccPorCurso = async (idCurso) => {
	const temas = await model.TemaTcc.findAll({
		include: [
			{
				model: model.AreaTcc,
				required: true,
			},
			{
				model: model.Docente,
				required: true,
				include: [
					{
						model: model.Curso,
						as: "cursosOrientacao",
						required: true,
						where: {
							id: idCurso,
						},
						attributes: [], // Não precisamos dos dados do curso na resposta
					},
				],
			},
		],
	});
	return temas;
};

// Buscar temas TCC por docente
temaTccRepository.obterTemasTccPorDocente = async (codigoDocente) => {
	const temas = await model.TemaTcc.findAll({
		where: {
			codigo_docente: codigoDocente,
		},
		include: [
			{
				model: model.AreaTcc,
				required: true,
			},
			{
				model: model.Docente,
				required: true,
			},
		],
	});
	return temas;
};

// Buscar temas TCC por docente e curso específico
temaTccRepository.obterTemasTccPorDocenteECurso = async (
	codigoDocente,
	idCurso,
) => {
	const temas = await model.TemaTcc.findAll({
		where: {
			codigo_docente: codigoDocente,
		},
		include: [
			{
				model: model.AreaTcc,
				required: true,
			},
			{
				model: model.Docente,
				required: true,
				include: [
					{
						model: model.Curso,
						as: "cursosOrientacao",
						required: true,
						where: {
							id: idCurso,
						},
						attributes: [], // Não precisamos dos dados do curso na resposta
					},
				],
			},
		],
	});
	return temas;
};

// Buscar tema TCC por ID
temaTccRepository.obterTemaTccPorId = async (id) => {
	const tema = await model.TemaTcc.findByPk(id, {
		include: [
			{
				model: model.AreaTcc,
				required: true,
			},
			{
				model: model.Docente,
				required: true,
			},
		],
	});
	return tema;
};

// Criar novo tema TCC
temaTccRepository.criarTemaTcc = async (dadosTema) => {
	const tema = model.TemaTcc.build(dadosTema);
	const savedTema = await tema.save();
	return savedTema;
};

// Atualizar tema TCC
temaTccRepository.atualizarTemaTcc = async (id, dadosTema) => {
	const [linhasAfetadas] = await model.TemaTcc.update(dadosTema, {
		where: {
			id: id,
		},
	});
	return linhasAfetadas > 0;
};

// Atualizar vagas do tema TCC
temaTccRepository.atualizarVagasTemaTcc = async (id, vagas) => {
	const [linhasAfetadas] = await model.TemaTcc.update(
		{
			vagas: vagas,
		},
		{
			where: {
				id: id,
			},
		},
	);
	return linhasAfetadas > 0;
};

// Deletar tema TCC
temaTccRepository.deletarTemaTcc = async (id) => {
	const deleted = await model.TemaTcc.destroy({
		where: {
			id: id,
		},
	});
	return deleted > 0;
};

// Buscar oferta do docente
temaTccRepository.buscarOfertaDocente = async (
	ano,
	semestre,
	idCurso,
	codigoDocente,
) => {
	const docenteOferta = await model.DocenteOferta.findOne({
		where: {
			ano: ano,
			semestre: semestre,
			id_curso: parseInt(idCurso),
			fase: 1,
			codigo_docente: codigoDocente,
		},
	});
	return docenteOferta;
};

// Criar ou atualizar oferta do docente
temaTccRepository.criarOuAtualizarOfertaDocente = async (
	ano,
	semestre,
	idCurso,
	codigoDocente,
	vagas,
) => {
	const [docenteOferta, created] = await model.DocenteOferta.findOrCreate({
		where: {
			ano: ano,
			semestre: semestre,
			id_curso: parseInt(idCurso),
			fase: 1, // TCC1 como padrão
			codigo_docente: codigoDocente,
		},
		defaults: {
			vagas: parseInt(vagas) || 0,
		},
	});

	// Se já existia, atualizar as vagas
	if (!created) {
		await docenteOferta.update({
			vagas: parseInt(vagas) || 0,
		});
	}

	return docenteOferta;
};

module.exports = temaTccRepository;

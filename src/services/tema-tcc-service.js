const model = require("../models");
const { obterAnoSemestreAtual } = require("./ano-semestre-util");

const retornaTodosTemasTcc = async (req, res) => {
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

	return res.status(200).json(temas);
};

const retornaTemasTccPorCurso = async (req, res) => {
	const { id_curso } = req.params;

	try {
		// Obter ano e semestre atual usando a lógica baseada em ano_semestre
		const { ano: anoAtual, semestre: semestreAtual } =
			await obterAnoSemestreAtual();

		// Primeiro, buscar os temas TCC com docente e área
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
								id: id_curso,
							},
							attributes: [], // Não precisamos dos dados do curso na resposta
						},
					],
				},
			],
		});

		// Buscar vagas separadamente para cada docente
		const temasComVagas = await Promise.all(
			temas.map(async (tema) => {
				const temaData = tema.toJSON();

				// Buscar vagas da oferta do docente
				const docenteOferta = await model.DocenteOferta.findOne({
					where: {
						ano: anoAtual,
						semestre: semestreAtual,
						id_curso: parseInt(id_curso),
						fase: 1,
						codigo_docente: temaData.Docente.codigo,
					},
				});

				const vagasOferta = docenteOferta ? docenteOferta.vagas : 0;

				// Adicionar vagas da oferta ao objeto
				temaData.vagasOferta = vagasOferta;

				return temaData;
			}),
		);

		return res.status(200).json(temasComVagas);
	} catch (error) {
		console.log("Erro ao buscar temas TCC por curso:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

const retornaTemasTccPorDocente = async (req, res) => {
	const { codigo } = req.params;

	const temas = await model.TemaTcc.findAll({
		where: {
			codigo_docente: codigo,
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

	return res.status(200).json(temas);
};

const criaTemaTcc = async (req, res) => {
	const formData = req.body;

	const tema = model.TemaTcc.build(formData);

	const savedTema = await tema.save();

	return res.status(201).json(savedTema);
};

const atualizaTemaTcc = async (req, res) => {
	const formData = req.body;

	await model.TemaTcc.update(formData, {
		where: {
			id: formData.id,
		},
	});

	return res.status(200).json({ message: "Atualizado com sucesso!" });
};

const atualizaVagasTemaTcc = async (req, res) => {
	const { id } = req.params;
	const { vagas } = req.body;

	const updated = await model.TemaTcc.update(
		{
			vagas: vagas,
		},
		{
			where: {
				id: id,
			},
		},
	);

	return res.status(200).json(updated);
};

const deletaTemaTcc = async (req, res) => {
	const { id } = req.params;

	const deleted = await model.TemaTcc.destroy({
		where: {
			id: id,
		},
	});

	return res.status(200).json(deleted);
};

const atualizaVagasOfertaDocente = async (req, res) => {
	try {
		const { codigo_docente, id_curso } = req.params;
		const { vagas } = req.body;

		// Obter ano e semestre atual usando a lógica baseada em ano_semestre
		const { ano: anoAtual, semestre: semestreAtual } =
			await obterAnoSemestreAtual();

		// Buscar ou criar a oferta do docente
		const [docenteOferta, created] = await model.DocenteOferta.findOrCreate(
			{
				where: {
					ano: anoAtual,
					semestre: semestreAtual,
					id_curso: parseInt(id_curso),
					fase: 1, // TCC1 como padrão
					codigo_docente: codigo_docente,
				},
				defaults: {
					vagas: parseInt(vagas) || 0,
				},
			},
		);

		// Se já existia, atualizar as vagas
		if (!created) {
			await docenteOferta.update({
				vagas: parseInt(vagas) || 0,
			});
		}

		return res.status(200).json({
			message: "Vagas da oferta atualizadas com sucesso",
			docenteOferta: docenteOferta,
		});
	} catch (error) {
		console.log("Erro ao atualizar vagas da oferta do docente:", error);
		return res.status(500).json({ error: "Erro interno do servidor" });
	}
};

module.exports = {
	retornaTodosTemasTcc,
	retornaTemasTccPorCurso,
	retornaTemasTccPorDocente,
	criaTemaTcc,
	atualizaTemaTcc,
	atualizaVagasTemaTcc,
	deletaTemaTcc,
	atualizaVagasOfertaDocente,
};

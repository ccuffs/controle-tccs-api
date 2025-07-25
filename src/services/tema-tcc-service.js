const model = require("../models");

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

	// Buscar diretamente os temas TCC, incluindo docente e área
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
						as: 'cursosOrientacao',
						required: true,
						where: {
							id: id_curso,
						},
						attributes: [] // Não precisamos dos dados do curso na resposta
					}
				]
			},
		],
	});

	return res.status(200).json(temas);
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

module.exports = {
	retornaTodosTemasTcc,
	retornaTemasTccPorCurso,
	retornaTemasTccPorDocente,
	criaTemaTcc,
	atualizaTemaTcc,
	atualizaVagasTemaTcc,
	deletaTemaTcc,
};
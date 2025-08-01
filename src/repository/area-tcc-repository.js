const model = require("@backend/models");
const areaTccRepository = {};

// Buscar todas as áreas TCC com informações do docente
areaTccRepository.obterTodasAreasTcc = async () => {
	const areas = await model.AreaTcc.findAll({
		include: [
			{
				model: model.Docente,
				attributes: ["codigo", "nome", "email"],
			},
		],
		order: [["descricao", "ASC"]],
	});

	return areas;
};

// Buscar áreas TCC por docente
areaTccRepository.obterAreasTccPorDocente = async (codigoDocente) => {
	const areas = await model.AreaTcc.findAll({
		where: { codigo_docente: codigoDocente },
		order: [["descricao", "ASC"]],
	});

	return areas;
};

// Buscar área TCC por ID
areaTccRepository.obterAreaTccPorId = async (id) => {
	const area = await model.AreaTcc.findByPk(id, {
		include: [
			{
				model: model.Docente,
				attributes: ["codigo", "nome", "email"],
			},
		],
	});

	return area;
};

// Criar nova área TCC
areaTccRepository.criarAreaTcc = async (dadosArea) => {
	const area = model.AreaTcc.build(dadosArea);
	await area.save();
	return area;
};

// Atualizar área TCC
areaTccRepository.atualizarAreaTcc = async (id, dadosArea) => {
	const [linhasAfetadas] = await model.AreaTcc.update(dadosArea, {
		where: { id: id },
	});

	return linhasAfetadas > 0;
};

// Deletar área TCC
areaTccRepository.deletarAreaTcc = async (id) => {
	const deleted = await model.AreaTcc.destroy({
		where: { id: id },
	});

	return deleted > 0;
};

module.exports = areaTccRepository;

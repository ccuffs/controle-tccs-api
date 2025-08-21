const model = require("../models");

const ofertasTccRepository = {};

// Buscar todas as ofertas TCC com filtros
ofertasTccRepository.buscarOfertasTcc = async (where, include, order) => {
	return await model.OfertaTcc.findAll({
		where,
		include,
		order,
	});
};

// Buscar oferta TCC específica por chave
ofertasTccRepository.buscarOfertaTccPorChave = async (where, include) => {
	return await model.OfertaTcc.findOne({
		where,
		include,
	});
};

// Verificar se oferta já existe
ofertasTccRepository.verificarOfertaExistente = async (where) => {
	return await model.OfertaTcc.findOne({ where });
};

// Criar nova oferta TCC
ofertasTccRepository.criarOfertaTcc = async (dadosOferta) => {
	const oferta = model.OfertaTcc.build(dadosOferta);
	await oferta.save();
	return oferta;
};

// Atualizar oferta TCC
ofertasTccRepository.atualizarOfertaTcc = async (where, dadosOferta) => {
	const [updatedRowsCount] = await model.OfertaTcc.update(dadosOferta, {
		where,
	});
	return updatedRowsCount;
};

// Verificar trabalhos vinculados à oferta
ofertasTccRepository.contarTrabalhosVinculados = async (where) => {
	return await model.TrabalhoConclusao.count({ where });
};

// Deletar oferta TCC
ofertasTccRepository.deletarOfertaTcc = async (where) => {
	return await model.OfertaTcc.destroy({ where });
};

// Buscar ofertas ativas (últimos anos)
ofertasTccRepository.buscarOfertasAtivas = async (
	anoMinimo,
	include,
	order,
) => {
	return await model.OfertaTcc.findAll({
		where: {
			ano: {
				[model.Sequelize.Op.gte]: anoMinimo,
			},
		},
		include,
		order,
	});
};

// Buscar última oferta TCC
ofertasTccRepository.buscarUltimaOfertaTcc = async (include, order) => {
	return await model.OfertaTcc.findOne({
		include,
		order,
	});
};

module.exports = ofertasTccRepository;

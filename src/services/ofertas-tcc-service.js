const model = require("../models");

// Função para retornar todas as ofertas de TCC
const retornaTodasOfertasTcc = async (req, res) => {
	try {
		const ofertas = await model.OfertaTcc.findAll({
			include: [
				{
					model: model.Curso,
					attributes: ['id', 'nome', 'codigo']
				}
			],
			order: [['ano', 'DESC'], ['semestre', 'DESC'], ['fase', 'ASC']]
		});
		res.status(200).json({ ofertas: ofertas });
	} catch (error) {
		console.log("Erro ao buscar ofertas TCC:", error);
		res.sendStatus(500);
	}
};

module.exports = {
	retornaTodasOfertasTcc,
};
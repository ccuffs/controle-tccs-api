const model = require("../models");
const anoSemestreRepository = {};

anoSemestreRepository.obterTodosAnoSemestres = async () => {
	const anosSemestres = await model.AnoSemestre.findAll({
		order: [
			["ano", "ASC"],
			["semestre", "ASC"],
		],
	});

	return anosSemestres;
};

module.exports = anoSemestreRepository;

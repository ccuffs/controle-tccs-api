const model = require("@backend/models");
const anoSemestreRepository = {};

anoSemestreRepository.obterAnoSemestreAtual = async () => {
	const anoSemestre = await model.AnoSemestre.findOne({
		where: {
			ativo: true,
		},
	});

	return anoSemestre;
};

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

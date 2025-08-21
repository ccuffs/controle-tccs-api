const model = require("../models");

const dashboardRepository = {};

// Buscar total de TCCs na oferta
dashboardRepository.contarTccsNaOferta = async (where) => {
	return await model.TrabalhoConclusao.count({ where });
};

// Contar TCCs com orientador principal definido
dashboardRepository.contarTccsComOrientador = async (where, include) => {
	return await model.TrabalhoConclusao.count({
		where,
		include,
		distinct: true,
	});
};

// Buscar distribuição de TCCs por etapa
dashboardRepository.buscarDistribuicaoPorEtapa = async (
	where,
	include,
	group,
	order,
) => {
	return await model.TrabalhoConclusao.findAll({
		attributes: [
			"etapa",
			[
				model.Sequelize.fn(
					"COUNT",
					model.Sequelize.col("TrabalhoConclusao.id"),
				),
				"quantidade",
			],
		],
		where,
		include,
		group,
		order,
		raw: true,
	});
};

// Buscar período do semestre
dashboardRepository.buscarPeriodoSemestre = async (ano, semestre) => {
	return await model.AnoSemestre.findOne({
		where: { ano: parseInt(ano), semestre: parseInt(semestre) },
		raw: true,
	});
};

// Buscar convites por período
dashboardRepository.buscarConvitesPorPeriodo = async (where, include) => {
	return await model.Convite.findAll({
		attributes: ["data_envio", "orientacao"],
		where,
		include,
		raw: true,
	});
};

// Buscar convites de orientação com status
dashboardRepository.buscarConvitesOrientacaoStatus = async (where, include) => {
	const { fn, col, literal } = model.Sequelize;
	return await model.Convite.findAll({
		attributes: [
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NOT NULL THEN 1 ELSE 0 END',
					),
				),
				"respondidos",
			],
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NULL THEN 1 ELSE 0 END',
					),
				),
				"pendentes",
			],
			[fn("COUNT", col("Convite.id_tcc")), "total"],
		],
		where,
		include,
		raw: true,
	});
};

// Buscar convites de banca com status
dashboardRepository.buscarConvitesBancaStatus = async (where, include) => {
	const { fn, col, literal } = model.Sequelize;
	return await model.Convite.findAll({
		attributes: [
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NOT NULL THEN 1 ELSE 0 END',
					),
				),
				"respondidos",
			],
			[
				fn(
					"SUM",
					literal(
						'CASE WHEN "Convite"."data_feedback" IS NULL THEN 1 ELSE 0 END',
					),
				),
				"pendentes",
			],
			[fn("COUNT", col("Convite.id_tcc")), "total"],
		],
		where,
		include,
		raw: true,
	});
};

// Buscar orientadores disponíveis por curso
dashboardRepository.buscarOrientadoresCurso = async (where, include) => {
	return await model.OrientadorCurso.findAll({
		where,
		include,
		raw: true,
		nest: true,
	});
};

// Contar orientandos por docente
dashboardRepository.contarOrientandosPorDocente = async (
	where,
	include,
	group,
) => {
	const { fn, col } = model.Sequelize;
	return await model.Orientacao.findAll({
		attributes: [
			"codigo_docente",
			[
				fn("COUNT", fn("DISTINCT", col("Orientacao.id_tcc"))),
				"quantidade",
			],
		],
		where: { orientador: true },
		include,
		group,
		raw: true,
	});
};

// Contar defesas aceitas por docente
dashboardRepository.contarDefesasAceitasPorDocente = async (
	where,
	include,
	group,
) => {
	const { literal } = model.Sequelize;
	return await model.Convite.findAll({
		attributes: [
			"codigo_docente",
			[
				literal(
					'COUNT(DISTINCT ("Convite"."id_tcc", "Convite"."fase"))',
				),
				"quantidade",
			],
		],
		where: { aceito: true, orientacao: false },
		include,
		group,
		raw: true,
	});
};

// Buscar defesas agendadas
dashboardRepository.buscarDefesasAgendadas = async (where, include) => {
	return await model.Defesa.findAll({
		where,
		include,
		raw: true,
		nest: true,
	});
};

module.exports = dashboardRepository;

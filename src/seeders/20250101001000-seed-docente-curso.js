"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const docentes = [
			"ricardo.parizotto", "padilha", "anambasei", "gian", "diegohoff", "danielle.micolodelli",
			"andrei.braga", "animarchesan", "gabriel.guerra", "matiello", "edimar", "marina",
			"tainara", "felipe.grando", "samuel.feitosa", "eduardomallmann", "lucia.menoncini",
			"jaqueline.sulkovski", "asebben", "acneri", "braulio", "claunir.pavan", "dckroth",
			"duarte", "divane.marcon", "edson.santos", "ediovani.gaboardi", "emilio.wuerges",
			"fernando.bevilacqua", "glaucio.fontana", "graziela.tonin", "guilherme.dalbianco",
			"jaqueline.mecca", "janice.reichert", "jose.mendonca", "joviles.trevisol", "vitor.petry",
			"rosane.binotto", "luciana.gobi", "rosane.binoto", "lbordin", "luiz.visioli", "lcaimi",
			"marco.spohn", "mauricio", "milton.kist", "paulo.bosing", "paulo.hahn", "pericles",
			"angelo.zanela", "pedro.borges", "raquel.pegoraro", "rogerio.trapp", "schreiner.geomar",
			"ubi.vieira", "stela", "leonardorsl", "daniloenrico", "viviani.poyer", "neivadaluz",
			"fabiano.geremia", "vojniak", "lorenzon", "marta", "jefferson.caramori", "caio.santos",
			"neimar.assmann", "eliane.taffarel", "leonardo.ev", "guillermo.orsi", "sem.professor"
		];

		await queryInterface.bulkInsert(
			"docente_curso",
			docentes.map(codigo => ({
				id_curso: 1,
				codigo_docente: codigo,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			})),
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("docente_curso", null, {});
	},
};


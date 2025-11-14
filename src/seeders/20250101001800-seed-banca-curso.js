"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const docentes = [
			"gian", "andrei.braga", "felipe.grando", "samuel.feitosa", "braulio",
			"claunir.pavan", "duarte", "guilherme.dalbianco", "lcaimi", "marco.spohn",
			"raquel.pegoraro", "schreiner.geomar", "ricardo.parizotto", "julyane.lima", "humberto"
		];

		await queryInterface.bulkInsert(
			"banca_curso",
			docentes.map(codigo => ({
				id_curso: 1,
				codigo_docente: codigo,
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("banca_curso", null, {});
	},
};


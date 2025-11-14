"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const orientadores = [
			"gian", "andrei.braga", "felipe.grando", "samuel.feitosa", "braulio",
			"claunir.pavan", "duarte", "guilherme.dalbianco", "lcaimi", "marco.spohn",
			"raquel.pegoraro", "schreiner.geomar", "ricardo.parizotto"
		];

		await queryInterface.bulkInsert(
			"orientador_curso",
			orientadores.map(codigo => ({
				id_curso: 1,
				codigo_docente: codigo,
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("orientador_curso", null, {});
	},
};


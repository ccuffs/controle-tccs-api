"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const usuarios = [
			"gian", "ana", "claunir.pavan", "lcaimi", "andrei", "andrei.braga",
			"felipe.grando", "samuel.feitosa", "braulio", "duarte", "guilherme.dalbianco",
			"marco.spohn", "raquel.pegoraro", "schreiner.geomar", "ricardo.parizotto"
		];

		await queryInterface.bulkInsert(
			"usuario_curso",
			usuarios.map(id => ({
				id_curso: 1,
				id_usuario: id,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			})),
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("usuario_curso", null, {});
	},
};


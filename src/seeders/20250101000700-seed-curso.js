"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"curso",
			[
				{
					id: 1,
					codigo: "1100",
					nome: "Ciência da Computação",
					turno: "Vespertino/Noturno",
					coordenador: "claunir.pavan",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{},
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("curso", null, {});
	},
};

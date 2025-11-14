"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			"oferta_tcc",
			[
				{
					ano: 2025,
					semestre: 1,
					id_curso: 1,
					fase: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					ano: 2025,
					semestre: 1,
					id_curso: 1,
					fase: 2,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					ano: 2025,
					semestre: 2,
					id_curso: 1,
					fase: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					ano: 2025,
					semestre: 2,
					id_curso: 1,
					fase: 2,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{},
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("oferta_tcc", null, {});
	},
};

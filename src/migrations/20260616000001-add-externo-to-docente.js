"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const table = await queryInterface.describeTable({
			schema: "public",
			tableName: "docente",
		});

		if (!table.externo) {
			await queryInterface.addColumn(
				{ schema: "public", tableName: "docente" },
				"externo",
				{
					type: Sequelize.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
			);
		}

		if (!table.instituicao) {
			await queryInterface.addColumn(
				{ schema: "public", tableName: "docente" },
				"instituicao",
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
			);
		}
	},

	async down(queryInterface) {
		await queryInterface.removeColumn(
			{ schema: "public", tableName: "docente" },
			"externo",
		);
		await queryInterface.removeColumn(
			{ schema: "public", tableName: "docente" },
			"instituicao",
		);
	},
};

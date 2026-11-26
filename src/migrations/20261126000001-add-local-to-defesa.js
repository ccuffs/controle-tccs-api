"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		const table = await queryInterface.describeTable({
			schema: "public",
			tableName: "defesa",
		});

		if (!table.local) {
			await queryInterface.addColumn(
				{ schema: "public", tableName: "defesa" },
				"local",
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
			);
		}
	},

	async down(queryInterface) {
		await queryInterface.removeColumn(
			{ schema: "public", tableName: "defesa" },
			"local",
		);
	},
};

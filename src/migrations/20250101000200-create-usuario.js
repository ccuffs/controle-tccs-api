"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "usuario",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			nome: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true,
			},
		};
	},

	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			this.table,
			this.getTableData(Sequelize),
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable(this.table);
	},
};


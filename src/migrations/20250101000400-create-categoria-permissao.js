"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "categoria_permissao",
	},

	getTableData(Sequelize) {
		return {
			codigo: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			descricao: {
				type: Sequelize.STRING,
				allowNull: false,
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


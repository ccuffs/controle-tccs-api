"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "dicente",
	},

	getTableData(Sequelize) {
		return {
			matricula: {
				type: Sequelize.BIGINT,
				primaryKey: true,
				allowNull: false,
			},
			nome: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			id_usuario: {
				type: Sequelize.STRING,
				allowNull: true,
				references: {
					model: {
						schema: "public",
						tableName: "usuario",
					},
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
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


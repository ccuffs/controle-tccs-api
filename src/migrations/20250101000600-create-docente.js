"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "docente",
	},

	getTableData(Sequelize) {
		return {
			codigo: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			nome: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			sala: {
				type: Sequelize.INTEGER,
				allowNull: true,
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
			siape: {
				type: Sequelize.INTEGER,
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


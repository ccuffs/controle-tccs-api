"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "permissao",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			codigo: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			descricao: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			codigo_categoria_permissao: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "categoria_permissao",
					},
					key: "codigo",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
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


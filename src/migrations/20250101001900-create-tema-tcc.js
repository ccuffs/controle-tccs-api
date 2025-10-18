"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "tema_tcc",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			descricao: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			id_area_tcc: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "area_tcc",
					},
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			codigo_docente: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "docente",
					},
					key: "codigo",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			ativo: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
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


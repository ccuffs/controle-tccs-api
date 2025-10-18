"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "defesa",
	},

	getTableData(Sequelize) {
		return {
			id_tcc: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "trabalho_conclusao",
					},
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			membro_banca: {
				type: Sequelize.STRING,
				primaryKey: true,
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
			fase: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			data_defesa: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			avaliacao: {
				type: Sequelize.DOUBLE,
				allowNull: true,
			},
			orientador: {
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


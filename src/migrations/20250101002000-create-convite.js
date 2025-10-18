"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "convite",
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
			codigo_docente: {
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
				defaultValue: 0,
			},
			data_envio: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			mensagem_envio: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			data_feedback: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			aceito: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			mensagem_feedback: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			orientacao: {
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


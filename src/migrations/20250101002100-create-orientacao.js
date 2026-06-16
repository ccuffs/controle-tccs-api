"use strict";
const { ensureUpdatedAtTrigger } = require("./helpers/updated-at");

module.exports = {
	table: {
		schema: "public",
		tableName: "orientacao",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
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
			id_tcc: {
				type: Sequelize.INTEGER,
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
			orientador: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		};
	},

	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			this.table,
			this.getTableData(Sequelize),
		);

		await ensureUpdatedAtTrigger(queryInterface.sequelize, "orientacao", "update_orientacao_updated_at");
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_orientacao_updated_at ON public.orientacao;
		`);

		await queryInterface.dropTable(this.table);
	},
};

"use strict";
const { ensureUpdatedAtTrigger } = require("./helpers/updated-at");

module.exports = {
	table: {
		schema: "public",
		tableName: "grupo",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			nome: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			descricao: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			sistema: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 2,
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

		await ensureUpdatedAtTrigger(queryInterface.sequelize, "grupo", "update_grupo_updated_at");
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_grupo_updated_at ON public.grupo;
		`);

		await queryInterface.dropTable(this.table);
	},
};

"use strict";
const { ensureUpdatedAtTrigger } = require("./helpers/updated-at");

module.exports = {
	table: {
		schema: "public",
		tableName: "grupo_permissao",
	},

	getTableData(Sequelize) {
		return {
			id_grupo: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "grupo",
					},
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			id_permissao: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "permissao",
					},
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
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

		await ensureUpdatedAtTrigger(queryInterface.sequelize, "grupo_permissao", "update_grupo_permissao_updated_at");
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_grupo_permissao_updated_at ON public.grupo_permissao;
		`);

		await queryInterface.dropTable(this.table);
	},
};

"use strict";
const { ensureUpdatedAtTrigger } = require("./helpers/updated-at");

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

		await ensureUpdatedAtTrigger(queryInterface.sequelize, "defesa", "update_defesa_updated_at");
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_defesa_updated_at ON public.defesa;
		`);

		await queryInterface.dropTable(this.table);
	},
};

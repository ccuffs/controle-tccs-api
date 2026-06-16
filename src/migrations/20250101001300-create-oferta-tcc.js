"use strict";
const { ensureUpdatedAtTrigger } = require("./helpers/updated-at");
const { ensureForeignKey } = require("./helpers/foreign-key");

module.exports = {
	table: {
		schema: "public",
		tableName: "oferta_tcc",
	},

	getTableData(Sequelize) {
		return {
			ano: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			semestre: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			id_curso: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "curso",
					},
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			fase: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
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

		await ensureForeignKey(
			queryInterface.sequelize,
			"fk_ano_semestre_to_oferta_tcc",
			`
			ALTER TABLE public.oferta_tcc
			ADD CONSTRAINT fk_ano_semestre_to_oferta_tcc
			FOREIGN KEY (ano, semestre)
			REFERENCES public.ano_semestre(ano, semestre)
			ON UPDATE CASCADE ON DELETE CASCADE;
		`,
		);

		await ensureUpdatedAtTrigger(queryInterface.sequelize, "oferta_tcc", "update_oferta_tcc_updated_at");
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_oferta_tcc_updated_at ON public.oferta_tcc;
		`);

		await queryInterface.dropTable(this.table);
	},
};

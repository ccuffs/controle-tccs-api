"use strict";
const { ensureUpdatedAtTrigger } = require("./helpers/updated-at");
const { ensureForeignKey } = require("./helpers/foreign-key");

module.exports = {
	table: {
		schema: "public",
		tableName: "docente_disponibilidade_banca",
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
			data_defesa: {
				type: Sequelize.DATEONLY,
				primaryKey: true,
				allowNull: false,
			},
			hora_defesa: {
				type: Sequelize.TIME,
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
			"fk_oferta_tcc_to_docente_disponibilidade_banca",
			`
			ALTER TABLE public.docente_disponibilidade_banca
			ADD CONSTRAINT fk_oferta_tcc_to_docente_disponibilidade_banca
			FOREIGN KEY (ano, semestre, id_curso, fase)
			REFERENCES public.oferta_tcc(ano, semestre, id_curso, fase)
			ON UPDATE CASCADE ON DELETE CASCADE;
		`,
		);

		await ensureUpdatedAtTrigger(queryInterface.sequelize, "docente_disponibilidade_banca", "update_docente_disponibilidade_banca_updated_at");
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_docente_disponibilidade_banca_updated_at ON public.docente_disponibilidade_banca;
		`);

		await queryInterface.dropTable(this.table);
	},
};

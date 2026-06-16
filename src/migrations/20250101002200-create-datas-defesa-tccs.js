"use strict";
const { ensureUpdatedAtTrigger } = require("./helpers/updated-at");
const { ensureForeignKey } = require("./helpers/foreign-key");

module.exports = {
	table: {
		schema: "public",
		tableName: "datas_defesa_tccs",
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
			inicio: {
				type: Sequelize.DATEONLY,
				allowNull: true,
			},
			fim: {
				type: Sequelize.DATEONLY,
				allowNull: true,
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
			"fk_oferta_tcc_to_datas_defesas",
			`
			ALTER TABLE public.datas_defesa_tccs
			ADD CONSTRAINT fk_oferta_tcc_to_datas_defesas
			FOREIGN KEY (ano, semestre, id_curso, fase)
			REFERENCES public.oferta_tcc(ano, semestre, id_curso, fase)
			ON UPDATE CASCADE ON DELETE CASCADE;
		`,
		);

		await ensureUpdatedAtTrigger(queryInterface.sequelize, "datas_defesa_tccs", "update_datas_defesa_tccs_updated_at");
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_datas_defesa_tccs_updated_at ON public.datas_defesa_tccs;
		`);

		await queryInterface.dropTable(this.table);
	},
};

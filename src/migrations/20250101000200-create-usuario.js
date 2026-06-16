"use strict";
const {
	ensureUpdatedAtFunction,
	ensureUpdatedAtTrigger,
} = require("./helpers/updated-at");

module.exports = {
	table: {
		schema: "public",
		tableName: "usuario",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			nome: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			email: {
				type: Sequelize.STRING,
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

		await ensureUpdatedAtFunction(queryInterface.sequelize);
		await ensureUpdatedAtTrigger(
			queryInterface.sequelize,
			"usuario",
			"update_usuario_updated_at",
		);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_usuario_updated_at ON public.usuario;
		`);

		await queryInterface.dropTable(this.table);

		// Remover função (apenas na primeira migration)
		await queryInterface.sequelize.query(`
			DROP FUNCTION IF EXISTS update_updated_at_column();
		`);
	},
};

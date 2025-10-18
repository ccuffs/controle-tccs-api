"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "dicente",
	},

	getTableData(Sequelize) {
		return {
			matricula: {
				type: Sequelize.BIGINT,
				primaryKey: true,
				allowNull: false,
			},
			nome: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		id_usuario: {
			type: Sequelize.STRING,
			allowNull: true,
			references: {
				model: {
					schema: "public",
					tableName: "usuario",
				},
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
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
		deletedAt: {
			type: Sequelize.DATE,
			allowNull: true,
		},
	};
},

	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			this.table,
			this.getTableData(Sequelize),
		);

		// Criar trigger para esta tabela
		await queryInterface.sequelize.query(`
			CREATE TRIGGER update_dicente_updated_at
			BEFORE UPDATE ON public.dicente
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_dicente_updated_at ON public.dicente;
		`);

		await queryInterface.dropTable(this.table);
	},
};


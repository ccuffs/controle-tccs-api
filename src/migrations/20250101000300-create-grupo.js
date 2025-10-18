"use strict";
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
			CREATE TRIGGER update_grupo_updated_at
			BEFORE UPDATE ON public.grupo
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_grupo_updated_at ON public.grupo;
		`);

		await queryInterface.dropTable(this.table);
	},
};


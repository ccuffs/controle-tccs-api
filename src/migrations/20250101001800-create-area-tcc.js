"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "area_tcc",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			descricao: {
				type: Sequelize.STRING,
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
			CREATE TRIGGER update_area_tcc_updated_at
			BEFORE UPDATE ON public.area_tcc
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_area_tcc_updated_at ON public.area_tcc;
		`);

		await queryInterface.dropTable(this.table);
	},
};


"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "curso",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			codigo: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			nome: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			turno: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
		coordenador: {
			type: Sequelize.STRING,
			allowNull: true,
			references: {
				model: {
					schema: "public",
					tableName: "docente",
				},
				key: "codigo",
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
	};
},

	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			this.table,
			this.getTableData(Sequelize),
		);

		// Criar trigger para esta tabela
		await queryInterface.sequelize.query(`
			CREATE TRIGGER update_curso_updated_at
			BEFORE UPDATE ON public.curso
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_curso_updated_at ON public.curso;
		`);

		await queryInterface.dropTable(this.table);
	},
};


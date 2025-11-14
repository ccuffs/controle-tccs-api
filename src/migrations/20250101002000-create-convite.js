"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "convite",
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
			fase: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				defaultValue: 0,
			},
			data_envio: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			mensagem_envio: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			data_feedback: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			aceito: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			mensagem_feedback: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			orientacao: {
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

		// Criar trigger para esta tabela
		await queryInterface.sequelize.query(`
			CREATE TRIGGER update_convite_updated_at
			BEFORE UPDATE ON public.convite
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_convite_updated_at ON public.convite;
		`);

		await queryInterface.dropTable(this.table);
	},
};

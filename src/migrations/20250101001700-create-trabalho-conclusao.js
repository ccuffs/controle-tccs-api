"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "trabalho_conclusao",
	},

	getTableData(Sequelize) {
		return {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			ano: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			semestre: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			id_curso: {
				type: Sequelize.INTEGER,
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
				allowNull: false,
			},
			matricula: {
				type: Sequelize.BIGINT,
				allowNull: false,
				references: {
					model: {
						schema: "public",
						tableName: "dicente",
					},
					key: "matricula",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			tema: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			titulo: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			resumo: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			seminario_andamento: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			etapa: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			aprovado_projeto: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			aprovado_tcc: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			comentarios_tcc: {
				type: Sequelize.TEXT,
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

		// Adicionar constraint de foreign key composta para oferta_tcc
		await queryInterface.sequelize.query(`
			ALTER TABLE public.trabalho_conclusao
			ADD CONSTRAINT fk_oferta_tcc_to_tcc
			FOREIGN KEY (ano, semestre, id_curso, fase)
			REFERENCES public.oferta_tcc(ano, semestre, id_curso, fase)
			ON UPDATE CASCADE ON DELETE CASCADE;
		`);

		// Criar índice único conforme database.sql
		await queryInterface.addIndex(this.table, {
			fields: ["id", "ano", "semestre", "id_curso", "fase", "matricula"],
			unique: true,
			name: "tcc_unique",
		});

		// Criar trigger para esta tabela
		await queryInterface.sequelize.query(`
			CREATE TRIGGER update_trabalho_conclusao_updated_at
			BEFORE UPDATE ON public.trabalho_conclusao
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_trabalho_conclusao_updated_at ON public.trabalho_conclusao;
		`);

		await queryInterface.dropTable(this.table);
	},
};

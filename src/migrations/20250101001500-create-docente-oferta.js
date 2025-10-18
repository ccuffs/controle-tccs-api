"use strict";
module.exports = {
	table: {
		schema: "public",
		tableName: "docente_oferta",
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
				defaultValue: 1,
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
		vagas: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
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

		// Adicionar constraint de foreign key composta para oferta_tcc
		await queryInterface.sequelize.query(`
			ALTER TABLE public.docente_oferta
			ADD CONSTRAINT fk_oferta_tcc_to_docente_oferta
			FOREIGN KEY (ano, semestre, id_curso, fase)
			REFERENCES public.oferta_tcc(ano, semestre, id_curso, fase)
			ON UPDATE CASCADE ON DELETE CASCADE;
		`);

		// Adicionar constraint de foreign key composta para ano_semestre
		await queryInterface.sequelize.query(`
			ALTER TABLE public.docente_oferta
			ADD CONSTRAINT fk_ano_semestre_to_docente_oferta
			FOREIGN KEY (ano, semestre)
			REFERENCES public.ano_semestre(ano, semestre)
			ON UPDATE CASCADE ON DELETE CASCADE;
		`);

		// Criar trigger para esta tabela
		await queryInterface.sequelize.query(`
			CREATE TRIGGER update_docente_oferta_updated_at
			BEFORE UPDATE ON public.docente_oferta
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
	},

	async down(queryInterface, Sequelize) {
		// Remover trigger
		await queryInterface.sequelize.query(`
			DROP TRIGGER IF EXISTS update_docente_oferta_updated_at ON public.docente_oferta;
		`);

		await queryInterface.dropTable(this.table);
	},
};


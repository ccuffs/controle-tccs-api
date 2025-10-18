"use strict";
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
		};
	},

	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			this.table,
			this.getTableData(Sequelize),
		);

		// Adicionar constraint de foreign key composta para oferta_tcc
		await queryInterface.sequelize.query(`
			ALTER TABLE public.datas_defesa_tccs
			ADD CONSTRAINT fk_oferta_tcc_to_datas_defesas
			FOREIGN KEY (ano, semestre, id_curso, fase)
			REFERENCES public.oferta_tcc(ano, semestre, id_curso, fase)
			ON UPDATE CASCADE ON DELETE CASCADE;
		`);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable(this.table);
	},
};


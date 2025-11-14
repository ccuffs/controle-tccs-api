"use strict";
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

		// Criar função para atualizar automaticamente o campo updatedAt (apenas na primeira migration)
		await queryInterface.sequelize.query(`
			CREATE OR REPLACE FUNCTION update_updated_at_column()
			RETURNS TRIGGER AS $$
			BEGIN
				NEW."updatedAt" = CURRENT_TIMESTAMP;
				RETURN NEW;
			END;
			$$ language 'plpgsql';
		`);

		// Criar trigger para esta tabela
		await queryInterface.sequelize.query(`
			CREATE TRIGGER update_usuario_updated_at
			BEFORE UPDATE ON public.usuario
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
		`);
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


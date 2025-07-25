"use strict";

module.exports = (sequelize, DataTypes) => {
	const ProjetoTcc = sequelize.define(
		"ProjetoTcc",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			descricao: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			id_area_tcc: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			codigo_docente: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			vagas: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
		},
		{
			tableName: "projeto_tcc",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	ProjetoTcc.associate = (models) => {
		// Associação com AreaTcc
		ProjetoTcc.belongsTo(models.AreaTcc, {
			foreignKey: "id_area_tcc",
			targetKey: "id",
		});

		// Associação com Docente
		ProjetoTcc.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
		});
	};

	return ProjetoTcc;
};
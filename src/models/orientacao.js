"use strict";

module.exports = (sequelize, DataTypes) => {
	const Orientacao = sequelize.define(
		"Orientacao",
		{
			codigo: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			matricula: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
		},
		{
			tableName: "orientacao",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Orientacao.associate = (models) => {
		Orientacao.belongsTo(models.Docente, {
			foreignKey: "codigo",
			targetKey: "codigo",
		});
		Orientacao.belongsTo(models.Dicente, {
			foreignKey: "matricula",
			targetKey: "matricula",
		});
	};

	return Orientacao;
};

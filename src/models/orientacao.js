"use strict";

module.exports = (sequelize, DataTypes) => {
	const Orientacao = sequelize.define(
		"Orientacao",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			codigo_docente: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			id_tcc: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			orientador: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
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
		// Associação com Docente
		Orientacao.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
		});

		// Associação com TrabalhoConclusao
		Orientacao.belongsTo(models.TrabalhoConclusao, {
			foreignKey: "id_tcc",
			targetKey: "id",
		});
	};

	return Orientacao;
};

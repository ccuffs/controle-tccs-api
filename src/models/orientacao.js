"use strict";

module.exports = (sequelize, DataTypes) => {
	const Orientacao = sequelize.define(
		"Orientacao",
		{
			ano: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			semestre: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			id_curso: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			fase: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			matricula: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			codigo: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			tableName: "orientacao",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Orientacao.associate = (models) => {
		// Associação com OfertaTcc (chave estrangeira composta)
		Orientacao.belongsTo(models.OfertaTcc, {
			foreignKey: ["ano", "semestre", "id_curso", "fase"],
			targetKey: ["ano", "semestre", "id_curso", "fase"],
		});

		// Associação com Dicente
		Orientacao.belongsTo(models.Dicente, {
			foreignKey: "matricula",
			targetKey: "matricula",
		});

		// Associação com Docente
		Orientacao.belongsTo(models.Docente, {
			foreignKey: "codigo",
			targetKey: "codigo",
		});
	};

	return Orientacao;
};

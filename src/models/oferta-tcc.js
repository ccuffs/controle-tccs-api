"use strict";

module.exports = (sequelize, DataTypes) => {
	const OfertaTcc = sequelize.define(
		"OfertaTcc",
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
		},
		{
			tableName: "oferta_tcc",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	OfertaTcc.associate = (models) => {
		OfertaTcc.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
		});

		// Associação com Orientacao usando chave composta
		OfertaTcc.hasMany(models.Orientacao, {
			foreignKey: ["ano", "semestre", "id_curso", "fase"],
			sourceKey: ["ano", "semestre", "id_curso", "fase"],
		});
	};

	return OfertaTcc;
};
"use strict";

module.exports = (sequelize, DataTypes) => {
	const AnoSemestre = sequelize.define(
		"AnoSemestre",
		{
			ano: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			semestre: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			inicio: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			fim: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			tableName: "ano_semestre",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	AnoSemestre.associate = function (models) {
		// Associação com DocenteOferta
		AnoSemestre.hasMany(models.DocenteOferta, {
			foreignKey: "ano",
			sourceKey: "ano",
			scope: {
				semestre: sequelize.col("AnoSemestre.semestre"),
			},
			constraints: false,
		});
	};

	return AnoSemestre;
};

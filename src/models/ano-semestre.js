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
			publicado: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
			},
			deletedAt: {
				allowNull: true,
				type: DataTypes.DATE,
			},
		},
		{
			tableName: "ano_semestre",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
			paranoid: true,
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

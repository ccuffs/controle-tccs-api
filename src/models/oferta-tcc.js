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
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			tableName: "oferta_tcc",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
		},
	);

	OfertaTcc.associate = (models) => {
		// Relacionamento com Curso
		OfertaTcc.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
		});
	};

	return OfertaTcc;
};

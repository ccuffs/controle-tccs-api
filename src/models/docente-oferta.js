"use strict";

module.exports = (sequelize, DataTypes) => {
	const DocenteOferta = sequelize.define(
		"DocenteOferta",
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
			id_curso: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			fase: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				defaultValue: 1,
			},
			codigo_docente: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			vagas: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
		},
		{
			tableName: "docente_oferta",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	DocenteOferta.associate = (models) => {
		// Associação com Docente
		DocenteOferta.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
		});

		// Associação com Curso
		DocenteOferta.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
		});

		// Associação com AnoSemestre
		DocenteOferta.belongsTo(models.AnoSemestre, {
			foreignKey: "ano",
			targetKey: "ano",
			scope: {
				semestre: sequelize.col('DocenteOferta.semestre')
			},
			constraints: false
		});
	};

	return DocenteOferta;
};

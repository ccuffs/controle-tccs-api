"use strict";

module.exports = (sequelize, DataTypes) => {
	const Docente = sequelize.define(
		"Docente",
		{
			codigo: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			nome: DataTypes.STRING,
			sala: DataTypes.INTEGER,
		},
		{
			sequelize,
			tableName: "docente",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Docente.associate = function(models) {
		// Associação many-to-many com Curso através da tabela docente_curso
		Docente.belongsToMany(models.Curso, {
			through: models.DocenteCurso,
			foreignKey: 'codigo_docente',
			otherKey: 'id_curso',
			as: 'cursos'
		});

		// Associação many-to-many com Curso através da tabela orientadores_curso (orientações)
		Docente.belongsToMany(models.Curso, {
			through: models.OrientadorCurso,
			foreignKey: 'codigo_docente',
			otherKey: 'id_curso',
			as: 'cursosOrientacao'
		});

		// Associação com Orientacao
		Docente.hasMany(models.Orientacao, {
			foreignKey: "codigo",
			sourceKey: "codigo",
		});
	};

	return Docente;
};

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

	Docente.associate = function (models) {
		// Associação many-to-many com Curso através da tabela docente_curso
		Docente.belongsToMany(models.Curso, {
			through: models.DocenteCurso,
			foreignKey: "codigo_docente",
			otherKey: "id_curso",
			as: "cursos",
		});

		// Associação many-to-many com Curso através da tabela orientadores_curso (orientações)
		Docente.belongsToMany(models.Curso, {
			through: "orientadores_curso",
			foreignKey: "codigo_docente",
			otherKey: "id_curso",
			as: "cursosOrientacao",
		});

		// Associação com Orientacao
		Docente.hasMany(models.Orientacao, {
			foreignKey: "codigo_docente",
			sourceKey: "codigo",
		});

		// Associação com Convite
		Docente.hasMany(models.Convite, {
			foreignKey: "codigo_docente",
			sourceKey: "codigo",
		});

		// Associação com Defesa para membro_banca_a
		Docente.hasMany(models.Defesa, {
			foreignKey: "membro_banca_a",
			sourceKey: "codigo",
			as: "defesasMembroA",
		});

		// Associação com Defesa para membro_banca_b
		Docente.hasMany(models.Defesa, {
			foreignKey: "membro_banca_b",
			sourceKey: "codigo",
			as: "defesasMembroB",
		});

		// Associação com AreaTcc
		Docente.hasMany(models.AreaTcc, {
			foreignKey: "codigo_docente",
			sourceKey: "codigo",
		});

		// Associação com TemaTcc
		Docente.hasMany(models.TemaTcc, {
			foreignKey: "codigo_docente",
			sourceKey: "codigo",
		});

		// Associação com DocenteOferta
		Docente.hasMany(models.DocenteOferta, {
			foreignKey: "codigo_docente",
			sourceKey: "codigo",
		});
	};

	return Docente;
};

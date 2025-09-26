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
			siape: DataTypes.INTEGER,
			id_usuario: {
				type: DataTypes.STRING,
				allowNull: true,
			},
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
		// Associação com Usuario
		Docente.belongsTo(models.Usuario, {
			foreignKey: "id_usuario",
			targetKey: "id",
		});

		// Associação many-to-many com Curso através da tabela docente_curso
		Docente.belongsToMany(models.Curso, {
			through: models.DocenteCurso,
			foreignKey: "codigo_docente",
			otherKey: "id_curso",
			as: "cursos",
		});

		// Associação many-to-many com Curso através da tabela orientadores_curso (orientações)
		Docente.belongsToMany(models.Curso, {
			through: models.OrientadorCurso,
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

		// Associação com Defesa para membro_banca
		Docente.hasMany(models.Defesa, {
			foreignKey: "membro_banca",
			sourceKey: "codigo",
			as: "defesas",
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

		// Associação com Curso (coordenador)
		Docente.hasMany(models.Curso, {
			foreignKey: "coordenador",
			sourceKey: "codigo",
			as: "cursosCoordenados",
		});
	};

	return Docente;
};

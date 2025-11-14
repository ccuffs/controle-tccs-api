"use strict";

module.exports = (sequelize, DataTypes) => {
	const Curso = sequelize.define(
		"Curso",
		{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		codigo: DataTypes.INTEGER,
		nome: DataTypes.TEXT,
		turno: DataTypes.TEXT,
		coordenador: DataTypes.STRING,
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
		sequelize,
		tableName: "curso",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		},
	);

	Curso.associate = function (models) {
		// Associação com Docente (coordenador)
		Curso.belongsTo(models.Docente, {
			foreignKey: "coordenador",
			targetKey: "codigo",
			as: "coordenadorDocente",
		});

		// Associação many-to-many com Docente através da tabela docente_curso
		Curso.belongsToMany(models.Docente, {
			through: models.DocenteCurso,
			foreignKey: "id_curso",
			otherKey: "codigo_docente",
			as: "docentes",
		});

		// Associação many-to-many com Docente através da tabela orientadores_curso (orientações)
		Curso.belongsToMany(models.Docente, {
			through: models.OrientadorCurso,
			foreignKey: "id_curso",
			otherKey: "codigo_docente",
			as: "orientadores",
		});

		// Associação many-to-many com Usuario através da tabela usuario_curso
		Curso.belongsToMany(models.Usuario, {
			through: models.UsuarioCurso,
			foreignKey: "id_curso",
			otherKey: "id_usuario",
			as: "usuarios",
		});

		// Associação com TrabalhoConclusao
		Curso.hasMany(models.TrabalhoConclusao, {
			foreignKey: "id_curso",
			sourceKey: "id",
		});

		// Associação com DocenteOferta
		Curso.hasMany(models.DocenteOferta, {
			foreignKey: "id_curso",
			sourceKey: "id",
		});
	};

	return Curso;
};

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
		},
		{
			sequelize,
			tableName: "curso",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Curso.associate = function (models) {
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
	};

	return Curso;
};

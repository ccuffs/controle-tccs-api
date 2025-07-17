"use strict";

module.exports = (sequelize, DataTypes) => {
	const Usuario = sequelize.define(
		"Usuario",
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			nome: DataTypes.STRING,
			email: DataTypes.STRING,
		},
		{
			sequelize,
			tableName: "usuario",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Usuario.associate = function(models) {
		// Associação many-to-many com Curso através da tabela usuario_curso
		Usuario.belongsToMany(models.Curso, {
			through: models.UsuarioCurso,
			foreignKey: 'id_usuario',
			otherKey: 'id_curso',
			as: 'cursos'
		});
	};

	return Usuario;
};
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
		sequelize,
		tableName: "usuario",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		paranoid: true,
		},
	);

	Usuario.associate = function (models) {
		// Associação many-to-many com Curso através da tabela usuario_curso
		Usuario.belongsToMany(models.Curso, {
			through: models.UsuarioCurso,
			foreignKey: "id_usuario",
			otherKey: "id_curso",
			as: "cursos",
		});

		// Associação many-to-many com Grupo através da tabela usuario_grupo
		Usuario.belongsToMany(models.Grupo, {
			through: models.UsuarioGrupo,
			foreignKey: "id_usuario",
			otherKey: "id_grupo",
			as: "grupos",
		});
	};

	return Usuario;
};

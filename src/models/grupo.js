"use strict";

module.exports = (sequelize, DataTypes) => {
	const Grupo = sequelize.define(
		"Grupo",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			nome: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			descricao: DataTypes.STRING,
			sistema: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 2,
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
			sequelize,
			tableName: "grupo",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
		},
	);

	Grupo.associate = function (models) {
		// Associação many-to-many com Permissao através da tabela grupo_permissao
		Grupo.belongsToMany(models.Permissao, {
			through: models.GrupoPermissao,
			foreignKey: "id_grupo",
			otherKey: "id_permissao",
			as: "permissoes",
		});

		// Associação many-to-many com Usuario através da tabela usuario_grupo
		Grupo.belongsToMany(models.Usuario, {
			through: models.UsuarioGrupo,
			foreignKey: "id_grupo",
			otherKey: "id_usuario",
			as: "usuarios",
		});
	};

	return Grupo;
};

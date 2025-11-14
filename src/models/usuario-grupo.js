"use strict";

module.exports = (sequelize, DataTypes) => {
	const UsuarioGrupo = sequelize.define(
		"UsuarioGrupo",
		{
			id_grupo: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "grupo",
					key: "id",
				},
			},
			id_usuario: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "usuario",
					key: "id",
				},
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
			tableName: "usuario_grupo",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
		},
	);

	UsuarioGrupo.associate = function (models) {
		// Associação com Grupo
		UsuarioGrupo.belongsTo(models.Grupo, {
			foreignKey: "id_grupo",
			targetKey: "id",
		});

		// Associação com Usuario
		UsuarioGrupo.belongsTo(models.Usuario, {
			foreignKey: "id_usuario",
			targetKey: "id",
		});
	};

	return UsuarioGrupo;
};

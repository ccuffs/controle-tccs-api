"use strict";

module.exports = (sequelize, DataTypes) => {
	const GrupoPermissao = sequelize.define(
		"GrupoPermissao",
		{
			id_grupo: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: 'grupo',
					key: 'id'
				}
			},
			id_permissao: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: 'permissoes',
					key: 'id'
				}
			},
		},
		{
			sequelize,
			tableName: "grupo_permissao",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	GrupoPermissao.associate = function(models) {
		// Associação com Grupo
		GrupoPermissao.belongsTo(models.Grupo, {
			foreignKey: 'id_grupo',
			targetKey: 'id'
		});

		// Associação com Permissoes
		GrupoPermissao.belongsTo(models.Permissoes, {
			foreignKey: 'id_permissao',
			targetKey: 'id'
		});
	};

	return GrupoPermissao;
}; 
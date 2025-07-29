"use strict";

module.exports = (sequelize, DataTypes) => {
	const CategoriaPermissao = sequelize.define(
		"CategoriaPermissao",
		{
			codigo: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			descricao: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "categoria_permissao",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	CategoriaPermissao.associate = function (models) {
		// Associação one-to-many com Permissao
		CategoriaPermissao.hasMany(models.Permissao, {
			foreignKey: "codigo_categoria_permissao",
			sourceKey: "codigo",
			as: "permissoes",
		});
	};

	return CategoriaPermissao;
};
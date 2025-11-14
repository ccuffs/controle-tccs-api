"use strict";

module.exports = (sequelize, DataTypes) => {
	const Permissao = sequelize.define(
		"Permissao",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			codigo: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			descricao: DataTypes.STRING,
			codigo_categoria_permissao: {
				type: DataTypes.STRING,
				allowNull: false,
				references: {
					model: "categoria_permissao",
					key: "codigo",
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
			tableName: "permissao",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
		},
	);

	Permissao.associate = function (models) {
		// Associação many-to-one com CategoriaPermissao
		Permissao.belongsTo(models.CategoriaPermissao, {
			foreignKey: "codigo_categoria_permissao",
			targetKey: "codigo",
			as: "categoria",
		});

		// Associação many-to-many com Grupo através da tabela grupo_permissao
		Permissao.belongsToMany(models.Grupo, {
			through: models.GrupoPermissao,
			foreignKey: "id_permissao",
			otherKey: "id_grupo",
			as: "grupos",
		});
	};

	return Permissao;
};

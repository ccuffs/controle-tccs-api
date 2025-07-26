"use strict";

module.exports = (sequelize, DataTypes) => {
	const Permissoes = sequelize.define(
		"Permissoes",
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
		},
		{
			sequelize,
			tableName: "permissoes",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Permissoes.associate = function (models) {
		// Associação many-to-many com Grupo através da tabela grupo_permissao
		Permissoes.belongsToMany(models.Grupo, {
			through: models.GrupoPermissao,
			foreignKey: "id_permissao",
			otherKey: "id_grupo",
			as: "grupos",
		});
	};

	return Permissoes;
};

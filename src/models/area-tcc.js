"use strict";

module.exports = (sequelize, DataTypes) => {
	const AreaTcc = sequelize.define(
		"AreaTcc",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			descicao: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			codigo: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: "area_tcc",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	AreaTcc.associate = (models) => {
		// Associação com ProjetoTcc
		AreaTcc.hasMany(models.ProjetoTcc, {
			foreignKey: "id_area_tcc",
			sourceKey: "id",
		});
	};

	return AreaTcc;
};
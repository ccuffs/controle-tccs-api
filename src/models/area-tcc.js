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
			descricao: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			codigo_docente: {
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
		// Associação com Docente
		AreaTcc.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
		});

		// Associação com TemaTcc
		AreaTcc.hasMany(models.TemaTcc, {
			foreignKey: "id_area_tcc",
			sourceKey: "id",
		});
	};

	return AreaTcc;
};

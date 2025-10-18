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
		tableName: "area_tcc",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		paranoid: true,
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

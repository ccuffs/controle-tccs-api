"use strict";

module.exports = (sequelize, DataTypes) => {
	const TemaTcc = sequelize.define(
		"TemaTcc",
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
			id_area_tcc: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			codigo_docente: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		ativo: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
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
		tableName: "tema_tcc",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		paranoid: true,
		},
	);

	TemaTcc.associate = (models) => {
		// Associação com AreaTcc
		TemaTcc.belongsTo(models.AreaTcc, {
			foreignKey: "id_area_tcc",
			targetKey: "id",
		});

		// Associação com Docente
		TemaTcc.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
		});
	};

	return TemaTcc;
};

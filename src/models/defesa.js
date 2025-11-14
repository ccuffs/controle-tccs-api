"use strict";

module.exports = (sequelize, DataTypes) => {
	const Defesa = sequelize.define(
		"Defesa",
		{
			id_tcc: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			membro_banca: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			fase: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			data_defesa: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			avaliacao: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
		orientador: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
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
		tableName: "defesa",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		},
	);

	Defesa.associate = (models) => {
		// Associação com TrabalhoConclusao
		Defesa.belongsTo(models.TrabalhoConclusao, {
			foreignKey: "id_tcc",
			targetKey: "id",
		});

		// Associação com Docente para membro_banca
		Defesa.belongsTo(models.Docente, {
			foreignKey: "membro_banca",
			targetKey: "codigo",
			as: "membroBanca",
		});
	};

	return Defesa;
};

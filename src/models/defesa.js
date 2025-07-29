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
			membro_banca_a: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			membro_banca_b: {
				type: DataTypes.STRING,
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
		},
		{
			tableName: "defesa",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Defesa.associate = (models) => {
		// Associação com TrabalhoConclusao
		Defesa.belongsTo(models.TrabalhoConclusao, {
			foreignKey: "id_tcc",
			targetKey: "id",
		});

		// Associação com Docente para membro_banca_a
		Defesa.belongsTo(models.Docente, {
			foreignKey: "membro_banca_a",
			targetKey: "codigo",
			as: "membroBancaA",
		});

		// Associação com Docente para membro_banca_b
		Defesa.belongsTo(models.Docente, {
			foreignKey: "membro_banca_b",
			targetKey: "codigo",
			as: "membroBancaB",
		});
	};

	return Defesa;
};

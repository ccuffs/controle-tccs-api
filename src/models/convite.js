"use strict";

module.exports = (sequelize, DataTypes) => {
	const Convite = sequelize.define(
		"Convite",
		{
			id_tcc: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			codigo_docente: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			fase: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				defaultValue: 0,
			},
			data_envio: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			mensagem_envio: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			data_feedback: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			aceito: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			mensagem_feedback: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			orientacao: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		},
		{
			tableName: "convite",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Convite.associate = (models) => {
		// Associação com TrabalhoConclusao
		Convite.belongsTo(models.TrabalhoConclusao, {
			foreignKey: "id_tcc",
			targetKey: "id",
		});

		// Associação com Docente
		Convite.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
		});
	};

	return Convite;
};

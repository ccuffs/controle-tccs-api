"use strict";

module.exports = (sequelize, DataTypes) => {
	const Convite = sequelize.define(
		"Convite",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			id_tcc: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			codigo_docente: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			aceito: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			data_envio: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			data_aceite: {
				type: DataTypes.DATE,
				allowNull: true,
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

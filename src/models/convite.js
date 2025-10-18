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
		tableName: "convite",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		paranoid: true,
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

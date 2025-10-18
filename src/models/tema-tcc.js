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
		},
		{
			tableName: "tema_tcc",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
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

"use strict";

module.exports = (sequelize, DataTypes) => {
	const DatasDefesaTcc = sequelize.define(
		"DatasDefesaTcc",
		{
			ano: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			semestre: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			id_curso: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			fase: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			inicio: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			fim: {
				type: DataTypes.DATEONLY,
				allowNull: true,
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
			tableName: "datas_defesa_tccs",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
		},
	);

	DatasDefesaTcc.associate = (models) => {
		// Relacionamento com OfertaTcc (chave estrangeira composta)
		DatasDefesaTcc.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "ano",
				field: "ano",
			},
			targetKey: "ano",
			constraints: false,
		});

		DatasDefesaTcc.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "semestre",
				field: "semestre",
			},
			targetKey: "semestre",
			constraints: false,
		});

		DatasDefesaTcc.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "id_curso",
				field: "id_curso",
			},
			targetKey: "id_curso",
			constraints: false,
		});

		DatasDefesaTcc.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "fase",
				field: "fase",
			},
			targetKey: "fase",
			constraints: false,
		});

		// Relacionamento com Curso
		DatasDefesaTcc.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
		});
	};

	return DatasDefesaTcc;
};

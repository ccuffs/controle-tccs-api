"use strict";

module.exports = (sequelize, DataTypes) => {
	const TrabalhoConclusao = sequelize.define(
		"TrabalhoConclusao",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			ano: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			semestre: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			id_curso: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			fase: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			matricula: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			tema: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			titulo: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			resumo: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			etapa: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
		},
		{
			tableName: "trabalho_conclusao",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
			indexes: [
				{
					unique: true,
					name: "tcc_unique",
					fields: [
						"id",
						"ano",
						"semestre",
						"id_curso",
						"fase",
						"matricula",
					],
				},
			],
		},
	);

	TrabalhoConclusao.associate = (models) => {
		// Associação com Dicente
		TrabalhoConclusao.belongsTo(models.Dicente, {
			foreignKey: "matricula",
			targetKey: "matricula",
		});

		// Associação com Curso
		TrabalhoConclusao.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
		});

		// Associação com Orientacao
		TrabalhoConclusao.hasMany(models.Orientacao, {
			foreignKey: "id_tcc",
			sourceKey: "id",
		});

		// Associação com Convite
		TrabalhoConclusao.hasMany(models.Convite, {
			foreignKey: "id",
			sourceKey: "id",
		});

		// Associação com Defesa
		TrabalhoConclusao.hasOne(models.Defesa, {
			foreignKey: "id_tcc",
			sourceKey: "id",
		});
	};

	return TrabalhoConclusao;
};

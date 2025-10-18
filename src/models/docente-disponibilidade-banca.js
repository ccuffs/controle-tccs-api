"use strict";

module.exports = (sequelize, DataTypes) => {
	const DocenteDisponibilidadeBanca = sequelize.define(
		"DocenteDisponibilidadeBanca",
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
			codigo_docente: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			data_defesa: {
				type: DataTypes.DATEONLY,
				allowNull: false,
				primaryKey: true,
			},
		hora_defesa: {
			type: DataTypes.TIME,
			allowNull: false,
			primaryKey: true,
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
		tableName: "docente_disponibilidade_banca",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		paranoid: true,
		},
	);

	DocenteDisponibilidadeBanca.associate = (models) => {
		// Relacionamento com OfertaTcc (chave estrangeira composta)
		DocenteDisponibilidadeBanca.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "ano",
				field: "ano",
			},
			targetKey: "ano",
			constraints: false,
		});

		DocenteDisponibilidadeBanca.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "semestre",
				field: "semestre",
			},
			targetKey: "semestre",
			constraints: false,
		});

		DocenteDisponibilidadeBanca.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "id_curso",
				field: "id_curso",
			},
			targetKey: "id_curso",
			constraints: false,
		});

		DocenteDisponibilidadeBanca.belongsTo(models.OfertaTcc, {
			foreignKey: {
				name: "fase",
				field: "fase",
			},
			targetKey: "fase",
			constraints: false,
		});

		// Relacionamento com Docente
		DocenteDisponibilidadeBanca.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
		});

		// Relacionamento com Curso
		DocenteDisponibilidadeBanca.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
		});
	};

	return DocenteDisponibilidadeBanca;
};

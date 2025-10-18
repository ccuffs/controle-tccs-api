"use strict";

module.exports = (sequelize, DataTypes) => {
	const BancaCurso = sequelize.define(
		"BancaCurso",
		{
			id_curso: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "curso",
					key: "id",
				},
			},
			codigo_docente: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "docente",
					key: "codigo",
				},
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
			sequelize,
			tableName: "banca_curso",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
			paranoid: true,
		},
	);

	BancaCurso.associate = function (models) {
		// Associações para tabela de junção
		BancaCurso.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
			as: "curso",
		});

		BancaCurso.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
			as: "docente",
		});
	};

	return BancaCurso;
};

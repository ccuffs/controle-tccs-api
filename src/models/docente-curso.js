"use strict";

module.exports = (sequelize, DataTypes) => {
	const DocenteCurso = sequelize.define(
		"DocenteCurso",
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
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			tableName: "docente_curso",
			schema: "public",
			freezeTableName: true,
			timestamps: true,
		},
	);

	DocenteCurso.associate = function (models) {
		// Associações corretas para tabela de junção
		DocenteCurso.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
			as: "curso",
		});

		DocenteCurso.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
			as: "docente",
		});
	};

	return DocenteCurso;
};

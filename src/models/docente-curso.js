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
		},
		{
			sequelize,
			tableName: "docente_curso",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
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

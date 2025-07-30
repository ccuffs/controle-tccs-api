"use strict";

module.exports = (sequelize, DataTypes) => {
	const OrientadorCurso = sequelize.define(
		"OrientadorCurso",
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
			tableName: "orientadores_curso",
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	OrientadorCurso.associate = function (models) {
		// Associações para tabela de junção
		OrientadorCurso.belongsTo(models.Curso, {
			foreignKey: "id_curso",
			targetKey: "id",
			as: "curso",
		});

		OrientadorCurso.belongsTo(models.Docente, {
			foreignKey: "codigo_docente",
			targetKey: "codigo",
			as: "docente",
		});
	};

	return OrientadorCurso;
};

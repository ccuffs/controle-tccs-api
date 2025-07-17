"use strict";

module.exports = (sequelize, DataTypes) => {
	const UsuarioCurso = sequelize.define(
		"UsuarioCurso",
		{
			id_curso: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "curso",
					key: "id"
				}
			},
			id_usuario: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
				references: {
					model: "usuario",
					key: "id"
				}
			},
		},
		{
			sequelize,
			tableName: "usuario_curso",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	UsuarioCurso.associate = function(models) {
		// Associações corretas para tabela de junção
		UsuarioCurso.belongsTo(models.Curso, {
			foreignKey: 'id_curso',
			targetKey: 'id',
			as: 'curso'
		});

		UsuarioCurso.belongsTo(models.Usuario, {
			foreignKey: 'id_usuario',
			targetKey: 'id',
			as: 'usuario'
		});
	};

	return UsuarioCurso;
};
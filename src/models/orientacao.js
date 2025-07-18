module.exports = (sequelize, DataTypes) => {
	const Orientacao = sequelize.define(
		"orientacao",
		{
			codigo: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			matricula: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
		},
		{
			tableName: "orientacao",
			timestamps: false,
		},
	);

	Orientacao.associate = (models) => {
		Orientacao.belongsTo(models.docente, {
			foreignKey: "codigo",
			targetKey: "codigo",
		});
		Orientacao.belongsTo(models.dicente, {
			foreignKey: "matricula",
			targetKey: "matricula",
		});
	};

	return Orientacao;
};

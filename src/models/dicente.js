module.exports = (sequelize, DataTypes) => {
	const Dicente = sequelize.define(
		"Dicente",
		{
			matricula: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				allowNull: false,
			},
			nome: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: "dicente",
			schema: "public",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Dicente.associate = (models) => {
		// Associação com Orientacao
		Dicente.hasMany(models.Orientacao, {
			foreignKey: "matricula",
			sourceKey: "matricula",
		});
	};

	return Dicente;
};

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
			schema: "tccs",
			freezeTableName: true,
			timestamps: false,
		},
	);

	Dicente.associate = (models) => {
		// Associação com TrabalhoConclusao
		Dicente.hasMany(models.TrabalhoConclusao, {
			foreignKey: "matricula",
			sourceKey: "matricula",
		});
	};

	return Dicente;
};

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
		id_usuario: {
			type: DataTypes.STRING,
			allowNull: true,
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
		tableName: "dicente",
		schema: "public",
		freezeTableName: true,
		timestamps: true,
		},
	);

	Dicente.associate = (models) => {
		// Associação com Usuario
		Dicente.belongsTo(models.Usuario, {
			foreignKey: "id_usuario",
			targetKey: "id",
		});

		// Associação com TrabalhoConclusao
		Dicente.hasMany(models.TrabalhoConclusao, {
			foreignKey: "matricula",
			sourceKey: "matricula",
		});
	};

	return Dicente;
};

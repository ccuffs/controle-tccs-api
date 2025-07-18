module.exports = (sequelize, DataTypes) => {
	const Dicente = sequelize.define(
		"dicente",
		{
			matricula: {
				type: DataTypes.INTEGER,
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
			timestamps: false,
		},
	);
	return Dicente;
};

require("dotenv").config();

module.exports = {
	development: {
		username: process.env.DBUSER,
		password: process.env.DBPASS,
		database: process.env.DBNAME,
		host: process.env.DBHOST,
		port: process.env.DBPORT || 5432,
		dialect: "postgres",
		schema: "public",
		logging: console.log,
	},
	test: {
		username: process.env.DBUSER,
		password: process.env.DBPASS,
		database: process.env.DBNAME_TEST || process.env.DBNAME + "_test",
		host: process.env.DBHOST,
		port: process.env.DBPORT || 5432,
		dialect: "postgres",
		schema: "public",
		logging: false,
	},
	production: {
		username: process.env.DBUSER,
		password: process.env.DBPASS,
		database: process.env.DBNAME,
		host: process.env.DBHOST,
		port: process.env.DBPORT || 5432,
		dialect: "postgres",
		schema: "public",
		logging: false,
	},
};

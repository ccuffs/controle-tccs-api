const { Sequelize } = require("sequelize");
// 1114 is OID for timestamp in Postgres
// pgp.pg.types.setTypeParser(1114, (str) => str);

const cls = require("cls-hooked");
const transactionNamespace = cls.createNamespace("transaction_namespace");

Sequelize.useCLS(transactionNamespace);

const sequelize = new Sequelize(
    process.env.DBNAME,
    process.env.DBUSER,
    process.env.DBPASS,
    {
        host: process.env.DBHOST,
        port: process.env.DBPORT,
        database: process.env.DBNAME,
        username: process.env.DBUSER,
        password: process.env.DBPASS,
        schema: "public",
        dialect: "postgres",
        freezeTableName: false,
        syncOnAssociation: true,
        logging: console.log,
    },
);


module.exports = sequelize;
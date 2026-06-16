"use strict";

async function ensureForeignKey(sequelize, constraintName, alterSql) {
	const [rows] = await sequelize.query(
		`SELECT 1 FROM pg_constraint WHERE conname = :constraintName`,
		{ replacements: { constraintName } },
	);

	if (rows.length === 0) {
		await sequelize.query(alterSql);
	}
}

async function ensureIndex(sequelize, indexName, createSql) {
	const [rows] = await sequelize.query(
		`SELECT 1 FROM pg_indexes WHERE indexname = :indexName`,
		{ replacements: { indexName } },
	);

	if (rows.length === 0) {
		await sequelize.query(createSql);
	}
}

module.exports = { ensureForeignKey, ensureIndex };

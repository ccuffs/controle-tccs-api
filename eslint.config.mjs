import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

export default [
	{
		ignores: ["dist/**", "node_modules/**", "src/public/**"],
	},
	{
		files: ["src/**/*.ts", "test/**/*.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			...prettierConfig.rules,
			"@typescript-eslint/interface-name-prefix": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
		},
	},
];

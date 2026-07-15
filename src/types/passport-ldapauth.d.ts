declare module "passport-ldapauth" {
	interface LdapServerOptions {
		url: string;
		bindDN?: string;
		bindCredentials?: string;
		searchBase: string;
		searchFilter: string;
		searchAttributes?: string[];
	}

	interface LdapStrategyOptions {
		server: LdapServerOptions;
	}

	type VerifyCallback = (err: unknown, user?: unknown, info?: unknown) => void;
	type VerifyFunction = (user: unknown, done: VerifyCallback) => void;

	class LdapStrategy {
		name: string;
		constructor(options: LdapStrategyOptions, verify: VerifyFunction);
		authenticate(req: unknown, options?: unknown): void;
	}

	export = LdapStrategy;
}

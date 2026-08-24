// @types/ldapjs (3.x) types are slightly ahead of the ldapjs 2.x runtime pinned in
// package.json (mesma versão usada por ldapauth-fork/passport-ldapauth). Os métodos
// usados aqui (createClient/bind/search/unbind) são estáveis entre as duas versões.
declare module "ldapjs" {
	interface SearchEntryObject {
		[key: string]: unknown;
	}

	interface SearchEntry {
		object: SearchEntryObject;
	}

	interface SearchCallbackResponse {
		on(event: "searchEntry", listener: (entry: SearchEntry) => void): void;
		on(event: "error", listener: (err: Error) => void): void;
		on(event: "end", listener: (result: unknown) => void): void;
	}

	interface Client {
		bind(dn: string, password: string, callback: (err: Error | null) => void): void;
		search(
			base: string,
			options: { filter: string; scope: string; attributes: string[] },
			callback: (err: Error | null, res: SearchCallbackResponse) => void,
		): void;
		unbind(): void;
	}

	export function createClient(options: { url: string }): Client;
}

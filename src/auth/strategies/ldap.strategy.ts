import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import LdapApiStrategy from "passport-ldapauth";

interface LdapUser {
	uid: string;
	cn: string;
	mail: string;
}

/**
 * Porta de src/middleware/auth.js (estratégia LDAP do Passport). Registrada com o
 * nome "ldapauth" na instância global do passport, para ser chamada
 * programaticamente por AuthService.fazerLogin (igual ao código legado).
 */
@Injectable()
export class LdapStrategy extends PassportStrategy(LdapApiStrategy, "ldapauth") {
	constructor() {
		super({
			server: {
				url: process.env.LDAP_URL || "ldap://localhost:389",
				bindDN: process.env.LDAP_BIND_DN || "",
				bindCredentials: process.env.LDAP_BIND_CREDENTIALS || "",
				searchBase: process.env.LDAP_SEARCH_BASE || "dc=example,dc=com",
				searchFilter: process.env.LDAP_SEARCH_FILTER || "(uid={{username}})",
				searchAttributes: ["uid", "cn", "mail"],
			},
		});
	}

	async validate(user: LdapUser): Promise<{ id: string; nome: string; email: string }> {
		return {
			id: user.uid,
			nome: user.cn,
			email: user.mail,
		};
	}
}

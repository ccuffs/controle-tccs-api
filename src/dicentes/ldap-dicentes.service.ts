import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as ldap from "ldapjs";
import { Transaction } from "sequelize";
import { UsuarioCursoEntity, UsuarioEntity, UsuarioGrupoEntity } from "../database/entities";

const ldapConfig = {
	url: process.env.LDAP_URL || "ldap://localhost:389",
	bindDN: process.env.LDAP_BIND_DN || "",
	bindCredentials: process.env.LDAP_BIND_CREDENTIALS || "",
	searchBase: process.env.LDAP_SEARCH_BASE || "dc=example,dc=com",
};

interface DadosLdapPorCn {
	uid: string | null;
	mail: string | null;
	uffsEmailAlternativo: string | null;
}

export interface DadosLdapUsuarioCriado {
	uid: string;
	emailAlternativo: string | null;
}

function primeiro(valor: unknown): string | null {
	if (Array.isArray(valor)) {
		return (valor[0] as string) ?? null;
	}
	return (valor as string) ?? null;
}

/** Porta das funções de LDAP (ldapjs) de src/services/dicente-service.js. */
@Injectable()
export class LdapDicentesService {
	constructor(
		@InjectModel(UsuarioEntity)
		private readonly usuarioModel: typeof UsuarioEntity,
		@InjectModel(UsuarioCursoEntity)
		private readonly usuarioCursoModel: typeof UsuarioCursoEntity,
		@InjectModel(UsuarioGrupoEntity)
		private readonly usuarioGrupoModel: typeof UsuarioGrupoEntity,
	) {}

	private escapeLdapFilter(str: string | undefined | null): string {
		if (!str) return "";
		return str
			.replace(/\\/g, "\\5c")
			.replace(/\(/g, "\\28")
			.replace(/\)/g, "\\29")
			.replace(/\*/g, "\\2a")
			.replace(/\//g, "\\2f")
			.replace(/\0/g, "\\00");
	}

	private buscarDadosLdapPorCn(cn: string): Promise<DadosLdapPorCn | null> {
		return new Promise((resolve, reject) => {
			const client = ldap.createClient({ url: ldapConfig.url });

			client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, (err) => {
				if (err) {
					client.unbind();
					reject(new Error(`Erro ao conectar no LDAP: ${err.message}`));
					return;
				}

				const cnEscaped = this.escapeLdapFilter(cn);
				const searchOptions = {
					filter: `(cn=${cnEscaped})`,
					scope: "sub",
					attributes: ["uid", "cn", "mail", "uffsEmailAlternativo"],
				};

				client.search(ldapConfig.searchBase, searchOptions, (searchErr, res) => {
					if (searchErr) {
						client.unbind();
						reject(new Error(`Erro na busca LDAP: ${searchErr.message}`));
						return;
					}

					let found = false;

					res.on("searchEntry", (entry) => {
						found = true;
						client.unbind();
						resolve({
							uid: primeiro(entry.object.uid),
							mail: primeiro(entry.object.mail),
							uffsEmailAlternativo: primeiro(entry.object.uffsEmailAlternativo),
						});
					});

					res.on("error", (entryErr) => {
						client.unbind();
						reject(new Error(`Erro na busca LDAP: ${entryErr.message}`));
					});

					res.on("end", () => {
						if (!found) {
							client.unbind();
							resolve(null);
						}
					});
				});
			});
		});
	}

	/** Busca dados no LDAP e cria/atualiza usuário com associações (grupo ESTUDANTE=4). */
	async buscarLdapECriarUsuario(
		nome: string,
		transaction: Transaction,
		id_curso: number | undefined,
	): Promise<DadosLdapUsuarioCriado | null> {
		try {
			const resultadoLdap = await this.buscarDadosLdapPorCn(nome);

			if (!resultadoLdap || !resultadoLdap.uid) {
				return null;
			}

			const uid = resultadoLdap.uid;
			const mail = resultadoLdap.mail || null;
			const uffsEmailAlternativo = resultadoLdap.uffsEmailAlternativo || null;

			const [usuario, usuarioCriado] = await this.usuarioModel.findOrCreate({
				where: { id: uid },
				defaults: { id: uid, nome, email: mail },
				transaction,
			});

			if (!usuarioCriado) {
				const precisaAtualizar = usuario.nome !== nome || usuario.email !== mail;
				if (precisaAtualizar) {
					await usuario.update({ nome, email: mail }, { transaction });
				}
			}

			if (id_curso) {
				await this.usuarioCursoModel.findOrCreate({
					where: { id_usuario: uid, id_curso },
					defaults: { id_usuario: uid, id_curso },
					transaction,
				});
			}

			await this.usuarioGrupoModel.findOrCreate({
				where: { id_usuario: uid, id_grupo: 4 },
				defaults: { id_usuario: uid, id_grupo: 4 },
				transaction,
			});

			return { uid, emailAlternativo: uffsEmailAlternativo };
		} catch {
			// Retorna null em caso de erro para não bloquear a inserção do dicente (igual ao legado).
			return null;
		}
	}
}

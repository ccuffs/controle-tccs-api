const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LdapStrategy = require("passport-ldapauth");
const model = require("@backend/models");

// Configuração das opções do JWT
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET || "sua-chave-secreta-padrao", // Em produção, sempre use variável de ambiente
	algorithms: ["HS256"],
};

// Configuração das opções do LDAP
// A autenticação LDAP pode ser desabilitada definindo LDAP_ENABLED=false no .env
// Isso é útil para desenvolvimento local sem servidor LDAP disponível
const ldapOptions = {
	server: {
		url: process.env.LDAP_URL || "ldap://localhost:389",
		bindDN: process.env.LDAP_BIND_DN || "",
		bindCredentials: process.env.LDAP_BIND_CREDENTIALS || "",
		searchBase: process.env.LDAP_SEARCH_BASE || "dc=example,dc=com",
		searchFilter: process.env.LDAP_SEARCH_FILTER || "(uid={{username}})",
		searchAttributes: ["uid", "cn", "mail"],
	},
};

// Estratégia JWT para Passport
passport.use(
	new JwtStrategy(jwtOptions, async (payload, done) => {
		try {
			// Buscar usuário no banco de dados
			const usuario = await model.Usuario.findByPk(payload.userId);

			if (!usuario) {
				return done(null, false);
			}

			// Retornar usuário encontrado
			return done(null, usuario);
		} catch (error) {
			console.error("Erro na autenticação JWT:", error);
			return done(error, false);
		}
	}),
);

// Estratégia LDAP para Passport
passport.use(
	new LdapStrategy(ldapOptions, async (user, done) => {
		try {
			// O usuário foi autenticado com sucesso no LDAP
			// Retornar os dados do LDAP
			return done(null, {
				id: user.uid,
				nome: user.cn,
				email: user.mail,
			});
		} catch (error) {
			console.error("Erro na autenticação LDAP:", error);
			return done(error, false);
		}
	}),
);

/**
 * Middleware para verificar se o usuário está autenticado
 */
const auth = {};
auth.autenticarUsuario = (req, res, next) => {
	passport.authenticate("jwt", { session: false }, (err, usuario, info) => {
		if (err) {
			console.error("Erro na autenticação:", err);
			return res.status(500).json({
				message: "Erro interno do servidor na autenticação",
			});
		}

		if (!usuario) {
			return res.status(401).json({
				message: "Token inválido ou expirado",
			});
		}

		// Adicionar usuário ao objeto request
		req.usuario = usuario;
		next();
	})(req, res, next);
};

module.exports = {
	auth,
	passport,
};

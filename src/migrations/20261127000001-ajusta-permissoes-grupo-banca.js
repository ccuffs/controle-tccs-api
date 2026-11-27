"use strict";

/**
 * Deixa o grupo 5 (BANCA) só com as permissões usadas pelas telas do
 * perfil Banca do front (/banca/*): Início, Convites, Disponibilidade,
 * Avaliações, Declarações e Perfil.
 *
 * Antes desta migration o grupo tinha as mesmas permissões do orientador
 * (mais VISUALIZAR_TODOS_CURSOS), incluindo criar/editar temas, áreas,
 * TCCs, convites e orientações, que a banca não usa.
 *
 * As telas Início, Avaliações e Declarações também usam rotas liberadas
 * por grupo (dashboard e declarações aceitam BANCA), que não dependem
 * desta lista. Meu perfil (GET /docentes/meu-perfil e PUT /docentes) só
 * exige login.
 */

//  1 – VISUALIZAR_CURSO
//  2 – VISUALIZAR_TODOS_CURSOS                  → GET /cursos
// 11 – VISUALIZAR_ORIENTACOES                   → GET /banca-curso/docente/:codigo (Disponibilidade, Perfil)
// 26 – VISUALIZAR_OFERTAS                       → GET /ofertas-tcc (Disponibilidade)
// 36 – VISUALIZAR_TRABALHO_CONCLUSAO            → GET /defesas, GET /trabalho-conclusao/:id, GET /defesas/ata
// 39 – EDITAR_TRABALHO_CONCLUSAO                → PUT /defesas (avaliação)
// 41 – VISUALIZAR_CONVITE                       → GET /convites/docente/:codigo
// 44 – EDITAR_CONVITE                           → PUT /convites/:id/:codigo/:fase (responder convite)
// 46 – VISUALIZAR_DISPONIBILIDADE_BANCA
// 47 – VISUALIZAR_TODAS_DISPONIBILIDADES_BANCAS
// 48 – CRIAR_DISPONIBILIDADE_BANCA
// 49 – EDITAR_DISPONIBILIDADE_BANCA
// 50 – DELETAR_DISPONIBILIDADE_BANCA
const PERMISSOES_BANCA = [1, 2, 11, 26, 36, 39, 41, 44, 46, 47, 48, 49, 50];

// Lista que o grupo tinha antes (a do orientador + VISUALIZAR_TODOS_CURSOS).
const PERMISSOES_ANTERIORES = [
	1, 2, 11, 14, 16, 17, 21, 22, 23, 24, 25, 26, 30, 31, 32, 33, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
	50,
];

async function definirPermissoes(queryInterface, ids) {
	await queryInterface.sequelize.transaction(async (transaction) => {
		await queryInterface.sequelize.query(
			`DELETE FROM public.grupo_permissao WHERE id_grupo = 5 AND id_permissao NOT IN (:ids)`,
			{ replacements: { ids }, transaction },
		);
		await queryInterface.sequelize.query(
			`INSERT INTO public.grupo_permissao (id_grupo, id_permissao, "createdAt", "updatedAt")
			 SELECT 5, p.id, NOW(), NOW() FROM public.permissao p WHERE p.id IN (:ids)
			 ON CONFLICT (id_grupo, id_permissao) DO NOTHING`,
			{ replacements: { ids }, transaction },
		);
	});
}

module.exports = {
	async up(queryInterface) {
		await definirPermissoes(queryInterface, PERMISSOES_BANCA);
	},

	async down(queryInterface) {
		await definirPermissoes(queryInterface, PERMISSOES_ANTERIORES);
	},
};

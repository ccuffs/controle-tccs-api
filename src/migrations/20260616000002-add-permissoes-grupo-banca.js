"use strict";

/**
 * Adiciona o grupo 5 (BANCA) à tabela `grupo` (caso não exista)
 * e concede as permissões necessárias para que membros da banca
 * consigam visualizar e responder convites de TCC, gerenciar sua
 * disponibilidade de banca e avaliar defesas.
 *
 * Raiz do problema: o seed `20250101000800-seed-grupo-permissao.js`
 * atribuiu permissões apenas aos grupos 1–4, omitindo o grupo 5.
 */
module.exports = {
	async up(queryInterface) {
		// 1. Garantir que o grupo 5 (banca) existe na tabela `grupo`
		await queryInterface.sequelize.query(`
			INSERT INTO public.grupo (id, nome, descricao, sistema, "createdAt", "updatedAt")
			VALUES (5, 'banca', 'Membro de banca avaliadora de TCCs.', 2, NOW(), NOW())
			ON CONFLICT (id) DO NOTHING;
		`);

		// 2. Permissões necessárias para o grupo BANCA
		//
		//  11 – VISUALIZAR_ORIENTACOES      → GET /orientadores/docente/:codigo
		//                                     + PermissionContext em ConvitesRecebidosOrientador
		//  36 – VISUALIZAR_TRABALHO_CONCLUSAO → GET /defesas (Avaliar Defesas)
		//  39 – EDITAR_TRABALHO_CONCLUSAO     → PUT /defesas (salvar avaliações)
		//  41 – VISUALIZAR_CONVITE            → GET /convites/docente/:codigo
		//  44 – EDITAR_CONVITE                → PUT /convites/:id/:codigo/:fase (responder convite)
		//  46 – VISUALIZAR_DISPONIBILIDADE_BANCA
		//  47 – VISUALIZAR_TODAS_DISPONIBILIDADES_BANCAS
		//  48 – CRIAR_DISPONIBILIDADE_BANCA
		//  49 – EDITAR_DISPONIBILIDADE_BANCA
		//  50 – DELETAR_DISPONIBILIDADE_BANCA
		const bancaPermissoes = [11, 36, 39, 41, 44, 46, 47, 48, 49, 50];

		const rows = bancaPermissoes.map((id_permissao) => ({
			id_grupo: 5,
			id_permissao,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		await queryInterface.bulkInsert(
			{ schema: "public", tableName: "grupo_permissao" },
			rows,
			{ ignoreDuplicates: true },
		);
	},

	async down(queryInterface) {
		const bancaPermissoes = [11, 36, 39, 41, 44, 46, 47, 48, 49, 50];

		for (const id_permissao of bancaPermissoes) {
			await queryInterface.sequelize.query(`
				DELETE FROM public.grupo_permissao
				WHERE id_grupo = 5 AND id_permissao = ${id_permissao};
			`);
		}
	},
};

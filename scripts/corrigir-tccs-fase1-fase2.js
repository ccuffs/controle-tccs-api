#!/usr/bin/env node

/**
 * Script de correção: TCCs importados com o formato antigo (fase 1 → fase 2)
 *
 * O comportamento antigo atualizava o registro de fase 1 para fase=2 em vez de
 * criar dois registros separados. Este script identifica e corrige os registros
 * afetados, tratando dois cenários:
 *
 * CASO A — TCC em fase=2 com defesas de fase=1 ainda embutidas (sem TCC de fase=1
 *           separado). Ação:
 *   1. Reverte o TCC existente para fase=1 (restaura ano/semestre pela data da
 *      defesa, ajusta etapa=6 e aprovado_projeto=true)
 *   2. Cria um novo TCC de fase=2 com ano/semestre atuais e dados copiados
 *   3. Move defesas e convites de fase=2 (se houver) para o novo TCC
 *   4. Copia as orientações para o novo TCC de fase=2
 *   5. Cria convite de orientação (aceito=true) para o novo TCC de fase=2
 *
 * CASO B — TCC em fase=2 que já possui um TCC de fase=1 separado (correção
 *           parcial anterior). Trata dois sub-problemas independentes:
 *   1. Corrige o TCC de fase=1 quando necessário: ano/semestre (inferido da
 *      data de defesa), etapa=6, aprovado_projeto=true
 *   2. Cria o convite de orientação (aceito=true) no TCC de fase=2 caso falte
 *
 * Uso:
 *   node scripts/corrigir-tccs-fase1-fase2.js            # executa a correção
 *   node scripts/corrigir-tccs-fase1-fase2.js --dry-run  # apenas exibe o que seria feito
 */

const { Client } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DRY_RUN = process.argv.includes("--dry-run");

const dbConfig = {
	host: process.env.DBHOST || "localhost",
	port: parseInt(process.env.DBPORT || "5432", 10),
	user: process.env.DBUSER,
	password: process.env.DBPASS,
	database: process.env.DBNAME,
};

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function inferirAnoSemestre(dataDefesa) {
	const d = new Date(dataDefesa);
	// Julho (mês 7) pertence ao primeiro semestre
	return { ano: d.getFullYear(), semestre: d.getMonth() + 1 <= 7 ? 1 : 2 };
}

function log(msg)  { console.log(msg); }
function warn(msg) { console.warn("  ⚠️  " + msg); }
function ok(msg)   { console.log("  ✓  " + msg); }
function info(msg) { console.log("  →  " + msg); }

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * CASO A: TCCs em fase=2 com aprovado_projeto=true que ainda carregam
 * defesas de fase=1 embutidas E não possuem TCC de fase=1 separado.
 */
async function buscarCasoA(client) {
	const { rows } = await client.query(`
		SELECT DISTINCT
			tc.id, tc.matricula, tc.id_curso,
			tc.ano AS ano_fase2, tc.semestre AS semestre_fase2,
			tc.tema, tc.titulo, tc.resumo, tc.etapa
		FROM public.trabalho_conclusao tc
		INNER JOIN public.defesa d ON d.id_tcc = tc.id AND d.fase = 1
		WHERE tc.fase = 2
		  AND tc.aprovado_projeto = true
		  AND NOT EXISTS (
		      SELECT 1 FROM public.trabalho_conclusao tc2
		      WHERE tc2.matricula = tc.matricula
		        AND tc2.id_curso  = tc.id_curso
		        AND tc2.fase      = 1
		        AND tc2.id       != tc.id
		  )
		ORDER BY tc.id
	`);
	return rows;
}

/**
 * CASO B: Todos os pares (TCC fase=2, TCC fase=1) do mesmo aluno/curso onde
 * o TCC fase=1 já está com etapa=6 ou aprovado_projeto=true (defesa concluída).
 * Inclui tanto os casos do fluxo antigo (fase=2.aprovado_projeto=true) quanto
 * os do novo fluxo correto (fase=2.aprovado_projeto=false, etapa=7).
 * A lógica JS compara o período registrado com o inferido pela data de defesa.
 */
async function buscarCasoB(client) {
	const { rows } = await client.query(`
		SELECT
			tc.id            AS id_fase2,
			tc.matricula,
			tc.id_curso,
			tc.ano           AS ano_fase2,
			tc.semestre      AS semestre_fase2,
			tc.aprovado_projeto AS ap_fase2,
			tc2.id           AS id_fase1,
			tc2.ano          AS ano_fase1_atual,
			tc2.semestre     AS semestre_fase1_atual,
			tc2.aprovado_projeto AS ap_fase1,
			tc2.etapa        AS etapa_fase1,
			EXISTS (
			    SELECT 1 FROM public.convite c
			    WHERE c.id_tcc   = tc.id
			      AND c.orientacao = true
			      AND c.fase       = 2
			) AS convite_existe
		FROM public.trabalho_conclusao tc
		INNER JOIN public.trabalho_conclusao tc2
		    ON  tc2.matricula = tc.matricula
		    AND tc2.id_curso  = tc.id_curso
		    AND tc2.fase      = 1
		    AND tc2.id       != tc.id
		WHERE tc.fase = 2
		  AND (tc2.aprovado_projeto = true OR tc2.etapa = 6)
		ORDER BY tc.id
	`);
	return rows;
}

async function buscarDataDefesaFase1(client, idTcc) {
	const { rows } = await client.query(
		`SELECT MIN(data_defesa) AS data_defesa FROM public.defesa
		 WHERE id_tcc = $1 AND fase = 1`,
		[idTcc],
	);
	return rows[0]?.data_defesa ?? null;
}

/**
 * Busca a data de defesa de fase=1 pesquisando em dois TCCs candidatos
 * (o TCC original de fase=2 ainda pode ter as defesas de fase=1 embutidas,
 * ou elas já podem ter sido movidas para o TCC de fase=1 criado anteriormente).
 */
async function buscarDataDefesaFase1EmQualquer(client, idFase2, idFase1) {
	const { rows } = await client.query(
		`SELECT MIN(data_defesa) AS data_defesa FROM public.defesa
		 WHERE id_tcc IN ($1, $2) AND fase = 1`,
		[idFase2, idFase1],
	);
	return rows[0]?.data_defesa ?? null;
}

async function corrigirTccFase1(client, idFase1, ano, semestre) {
	await client.query(
		`UPDATE public.trabalho_conclusao
		 SET ano = $2, semestre = $3, etapa = 6,
		     aprovado_projeto = true, aprovado_tcc = false,
		     seminario_andamento = NULL, "updatedAt" = NOW()
		 WHERE id = $1`,
		[idFase1, ano, semestre],
	);
}

async function buscarOrientadorPrincipal(client, idTcc) {
	const { rows } = await client.query(
		`SELECT codigo_docente FROM public.orientacao
		 WHERE id_tcc = $1 AND orientador = true LIMIT 1`,
		[idTcc],
	);
	return rows[0]?.codigo_docente ?? null;
}

async function reverterTccParaFase1(client, id, ano, semestre) {
	await client.query(
		`UPDATE public.trabalho_conclusao
		 SET fase = 1, ano = $2, semestre = $3, etapa = 6,
		     aprovado_projeto = true, aprovado_tcc = false,
		     seminario_andamento = NULL, "updatedAt" = NOW()
		 WHERE id = $1`,
		[id, ano, semestre],
	);
}

async function criarTccFase2(client, tcc, anoFase2, semestreFase2) {
	const { rows } = await client.query(
		`INSERT INTO public.trabalho_conclusao
			(ano, semestre, id_curso, fase, matricula, tema, titulo, resumo,
			 etapa, aprovado_projeto, aprovado_tcc, seminario_andamento, "createdAt", "updatedAt")
		 VALUES ($1, $2, $3, 2, $4, $5, $6, $7, 7, false, false, NULL, NOW(), NOW())
		 RETURNING id`,
		[anoFase2, semestreFase2, tcc.id_curso, tcc.matricula,
		 tcc.tema, tcc.titulo, tcc.resumo],
	);
	return rows[0].id;
}

async function moverDefesasFase2(client, idAntigo, idNovo) {
	const { rowCount } = await client.query(
		`UPDATE public.defesa SET id_tcc = $1 WHERE id_tcc = $2 AND fase = 2`,
		[idNovo, idAntigo],
	);
	return rowCount;
}

async function moverConvitesFase2(client, idAntigo, idNovo) {
	const { rowCount } = await client.query(
		`UPDATE public.convite SET id_tcc = $1 WHERE id_tcc = $2 AND fase = 2`,
		[idNovo, idAntigo],
	);
	return rowCount;
}

async function copiarOrientacoes(client, idAntigo, idNovo) {
	const { rowCount } = await client.query(
		`INSERT INTO public.orientacao (codigo_docente, id_tcc, orientador, "createdAt", "updatedAt")
		 SELECT codigo_docente, $1, orientador, NOW(), NOW()
		 FROM public.orientacao
		 WHERE id_tcc = $2
		 ON CONFLICT DO NOTHING`,
		[idNovo, idAntigo],
	);
	return rowCount;
}

async function criarConviteOrientacaoFase2(client, idTcc, codigoDocente) {
	const mensagem = "Orientação copiada automaticamente da fase 1";
	const { rowCount } = await client.query(
		`INSERT INTO public.convite
			(id_tcc, codigo_docente, fase, data_envio, mensagem_envio,
			 data_feedback, aceito, mensagem_feedback, orientacao, "createdAt", "updatedAt")
		 VALUES ($1, $2, 2, NOW(), $3, NOW(), true, $3, true, NOW(), NOW())
		 ON CONFLICT (id_tcc, codigo_docente, fase) DO NOTHING`,
		[idTcc, codigoDocente, mensagem],
	);
	return rowCount;
}

// ---------------------------------------------------------------------------
// Processadores
// ---------------------------------------------------------------------------

async function processarCasoA(client, candidatos) {
	if (candidatos.length === 0) {
		log("Nenhum TCC do Caso A para corrigir.\n");
		return { corrigidos: 0, erros: 0 };
	}

	log(`CASO A — ${candidatos.length} TCC(s) para reverter + criar fase=2:\n`);
	const resumo = { corrigidos: 0, erros: 0 };

	for (const tcc of candidatos) {
		log(`  TCC id=${tcc.id} | matrícula=${tcc.matricula} | período fase=2: ${tcc.ano_fase2}/${tcc.semestre_fase2}`);

		const dataDefesaFase1 = await buscarDataDefesaFase1(client, tcc.id);
		if (!dataDefesaFase1) {
			warn("Nenhuma defesa de fase=1 com data. Pulando.");
			resumo.erros++;
			continue;
		}
		const { ano: anoFase1, semestre: semestreFase1 } = inferirAnoSemestre(dataDefesaFase1);
		info(`Defesa fase=1 em ${new Date(dataDefesaFase1).toLocaleDateString("pt-BR")} → período fase=1: ${anoFase1}/${semestreFase1}`);

		const orientador = await buscarOrientadorPrincipal(client, tcc.id);

		if (DRY_RUN) {
			ok(`[DRY-RUN] Reverteria TCC id=${tcc.id} para fase=1 (${anoFase1}/${semestreFase1}).`);
			ok(`[DRY-RUN] Criaria novo TCC fase=2 para ${tcc.ano_fase2}/${tcc.semestre_fase2}.`);
			if (orientador) ok(`[DRY-RUN] Criaria convite de orientação aceito para ${orientador}.`);
			else warn("[DRY-RUN] Sem orientador principal; convite não seria criado.");
			resumo.corrigidos++;
			continue;
		}

		try {
			await reverterTccParaFase1(client, tcc.id, anoFase1, semestreFase1);
			ok(`TCC id=${tcc.id} revertido para fase=1 (${anoFase1}/${semestreFase1}, etapa=6).`);

			const idNovo = await criarTccFase2(client, tcc, tcc.ano_fase2, tcc.semestre_fase2);
			ok(`Novo TCC fase=2 criado (id=${idNovo}, ${tcc.ano_fase2}/${tcc.semestre_fase2}, etapa=7).`);

			const defesas = await moverDefesasFase2(client, tcc.id, idNovo);
			const convites = await moverConvitesFase2(client, tcc.id, idNovo);
			ok(`${defesas} defesa(s) e ${convites} convite(s) de fase=2 movidos.`);

			const orientacoes = await copiarOrientacoes(client, tcc.id, idNovo);
			ok(`${orientacoes} orientação(ões) copiadas para o novo TCC.`);

			if (orientador) {
				const c = await criarConviteOrientacaoFase2(client, idNovo, orientador);
				ok(c > 0
					? `Convite de orientação (aceito=true) criado para ${orientador}.`
					: `Convite já existia para ${orientador} (não duplicado).`);
			} else {
				warn("Sem orientador principal; convite não criado.");
			}

			resumo.corrigidos++;
		} catch (err) {
			warn(`Erro: ${err.message}`);
			resumo.erros++;
		}
		log("");
	}

	return resumo;
}

async function processarCasoB(client, candidatos) {
	if (candidatos.length === 0) {
		log("Nenhum TCC do Caso B para corrigir.\n");
		return { corrigidos: 0, erros: 0 };
	}

	log(`CASO B — ${candidatos.length} par(es) fase=1/fase=2 a verificar:\n`);
	const resumo = { corrigidos: 0, semAlteracao: 0, erros: 0 };

	for (const tcc of candidatos) {
		const fluxo = tcc.ap_fase2 ? "antigo" : "novo";
		log(`  TCC fase=2 id=${tcc.id_fase2} | TCC fase=1 id=${tcc.id_fase1} | matrícula=${tcc.matricula} [fluxo ${fluxo}]`);
		log(`    fase=2 período: ${tcc.ano_fase2}/${tcc.semestre_fase2} | fase=1 atual: ${tcc.ano_fase1_atual}/${tcc.semestre_fase1_atual} ap_projeto=${tcc.ap_fase1} etapa=${tcc.etapa_fase1}`);

		// Determinar ano/semestre correto para o TCC de fase=1
		const dataDefesaFase1 = await buscarDataDefesaFase1EmQualquer(client, tcc.id_fase2, tcc.id_fase1);
		let anoFase1Correto  = tcc.ano_fase1_atual;
		let semFase1Correto  = tcc.semestre_fase1_atual;

		if (dataDefesaFase1) {
			const inferido = inferirAnoSemestre(dataDefesaFase1);
			anoFase1Correto = inferido.ano;
			semFase1Correto = inferido.semestre;
			info(`Defesa fase=1 em ${new Date(dataDefesaFase1).toLocaleDateString("pt-BR")} → período correto: ${anoFase1Correto}/${semFase1Correto}`);
		} else {
			warn("Nenhuma defesa de fase=1 encontrada; mantendo ano/semestre atual do TCC fase=1.");
		}

		const fase1JaCorreta =
			tcc.ap_fase1 === true &&
			parseInt(String(tcc.etapa_fase1)) === 6 &&
			Number(tcc.ano_fase1_atual) === anoFase1Correto &&
			Number(tcc.semestre_fase1_atual) === semFase1Correto;

		// Nada a fazer neste par
		if (fase1JaCorreta && tcc.convite_existe) {
			info("Sem pendências neste par (nenhuma alteração necessária).");
			resumo.semAlteracao++;
			log("");
			continue;
		}

		const orientador = await buscarOrientadorPrincipal(client, tcc.id_fase2);
		if (!orientador) {
			warn("Sem orientador no TCC fase=2 — convite não será criado.");
		} else {
			info(`Orientador: ${orientador}`);
		}

		if (DRY_RUN) {
			if (!fase1JaCorreta) {
				ok(`[DRY-RUN] Corrigiria TCC fase=1 id=${tcc.id_fase1}: ano=${anoFase1Correto}, semestre=${semFase1Correto}, etapa=6, aprovado_projeto=true.`);
			}
			if (!tcc.convite_existe && orientador) {
				ok(`[DRY-RUN] Criaria convite de orientação (aceito=true) para ${orientador} no TCC fase=2 id=${tcc.id_fase2}.`);
			} else if (!tcc.convite_existe && !orientador) {
				warn("[DRY-RUN] Convite não criado: sem orientador registrado.");
			}
			resumo.corrigidos++;
			log("");
			continue;
		}

		try {
			if (!fase1JaCorreta) {
				await corrigirTccFase1(client, tcc.id_fase1, anoFase1Correto, semFase1Correto);
				ok(`TCC fase=1 id=${tcc.id_fase1} corrigido: ${anoFase1Correto}/${semFase1Correto}, etapa=6, aprovado_projeto=true.`);
			}

			if (!tcc.convite_existe && orientador) {
				const c = await criarConviteOrientacaoFase2(client, tcc.id_fase2, orientador);
				ok(c > 0
					? `Convite de orientação (aceito=true) criado para ${orientador} no TCC fase=2.`
					: `Convite já existia para ${orientador} (não duplicado).`);
			}

			resumo.corrigidos++;
		} catch (err) {
			warn(`Erro: ${err.message}`);
			resumo.erros++;
		}
		log("");
	}

	return resumo;
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

async function main() {
	log("=".repeat(70));
	log("Correção de TCCs fase 1→fase 2 (formato antigo de importação)");
	log("=".repeat(70));
	if (DRY_RUN) log("MODO DRY-RUN: nenhuma alteração será gravada no banco.\n");

	const client = new Client(dbConfig);
	await client.connect();
	log(`Conectado ao banco: ${dbConfig.database} em ${dbConfig.host}\n`);

	try {
		const [casoA, casoB] = await Promise.all([
			buscarCasoA(client),
			buscarCasoB(client),
		]);

	log(`Casos A (reverter + criar novo fase=2) : ${casoA.length}`);
	log(`Casos B (corrigir fase=1 + convite)   : ${casoB.length}`);
		log("");

		if (casoA.length === 0 && casoB.length === 0) {
			log("Nenhum TCC precisa de correção. Encerrando.");
			return;
		}

		log("=".repeat(70));
		const resA = await processarCasoA(client, casoA);

		log("=".repeat(70));
		const resB = await processarCasoB(client, casoB);

		log("=".repeat(70));
		log("RESUMO FINAL");
		log("=".repeat(70));
	log(`Caso A corrigidos : ${resA.corrigidos}  |  erros: ${resA.erros}`);
	log(`Caso B corrigidos : ${resB.corrigidos}  |  sem alteração: ${resB.semAlteracao ?? 0}  |  erros: ${resB.erros}`);
		if (DRY_RUN) log("\nNenhuma alteração foi gravada (modo dry-run).");
	} finally {
		await client.end();
	}
}

main().catch((err) => {
	console.error("Erro fatal:", err.message);
	process.exit(1);
});

const express = require("express");
const defesaService = require("../services/defesa-service");
const disponibilidadeBancaRepository = require("../repository/disponibilidade-banca-repository");
const { auth, passport } = require("../middleware/auth");
const { autorizacao } = require("../middleware/autorizacao");
const { Permissoes } = require("../enums/permissoes");

const router = express.Router();

// Autenticação JWT
router.use(passport.authenticate("jwt", { session: false }));

// GET /api/defesas
router.get(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.retornaTodasDefesas,
);

// GET /api/defesas/tcc/:id_tcc
router.get(
	"/tcc/:id_tcc",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR,
		Permissoes.TRABALHO_CONCLUSAO.VISUALIZAR_TODOS,
	]),
	defesaService.retornaDefesasPorTcc,
);

// Função auxiliar para calcular o horário anterior
const calcularHorarioAnterior = (hora) => {
	const [horas, minutos, segundos] = hora.split(":").map(Number);
	let horaAnterior = horas;
	let minutoAnterior = minutos - 30;

	if (minutoAnterior < 0) {
		minutoAnterior = 30;
		horaAnterior -= 1;
	}

	// Se for antes das 13:30, retornar null (não há horário anterior)
	if (horaAnterior < 13 || (horaAnterior === 13 && minutoAnterior < 30)) {
		return null;
	}

	return `${horaAnterior.toString().padStart(2, "0")}:${minutoAnterior.toString().padStart(2, "0")}:00`;
};

// Função auxiliar para calcular o próximo horário
const calcularHorarioPosterior = (hora) => {
	const [horas, minutos, segundos] = hora.split(":").map(Number);
	let proximaHora = horas;
	let proximoMinuto = minutos + 30;

	if (proximoMinuto >= 60) {
		proximoMinuto = 0;
		proximaHora += 1;
	}

	// Se passar das 21:30, retornar null (não há próximo horário)
	if (proximaHora > 21 || (proximaHora === 21 && proximoMinuto > 30)) {
		return null;
	}

	return `${proximaHora.toString().padStart(2, "0")}:${proximoMinuto.toString().padStart(2, "0")}:00`;
};

// POST /api/defesas/agendar - Agenda defesa para orientador + 2 membros, removendo suas disponibilidades (transação)
router.post(
	"/agendar",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.CRIAR]),
	async (req, res) => {
		const model = require("../models");
		const t = await model.sequelize.transaction();

		try {
			const {
				id_tcc,
				fase,
				data,
				hora,
				codigo_orientador,
				membros_banca,
			} = req.body;

			if (
				!id_tcc ||
				!fase ||
				!data ||
				!hora ||
				!codigo_orientador ||
				!Array.isArray(membros_banca) ||
				membros_banca.length !== 2
			) {
				return res
					.status(400)
					.json({ message: "Parâmetros inválidos" });
			}

			// Criar/validar registros de defesa: orientador + 2 membros
			const docentes = [
				{ codigo: codigo_orientador, orientador: true },
				{ codigo: membros_banca[0], orientador: false },
				{ codigo: membros_banca[1], orientador: false },
			];

			// Criar data completa (DATE em modelo de defesa)
			// Combine data (YYYY-MM-DD) e hora (HH:mm:ss)
			const dataHora = new Date(`${data}T${hora}`);

			// Inserir defesas
			for (const d of docentes) {
				await model.Defesa.create(
					{
						id_tcc,
						membro_banca: d.codigo,
						fase,
						data_defesa: dataHora,
						orientador: d.orientador,
					},
					{ transaction: t },
				);
			}

			// Remover disponibilidades do slot escolhido para esses docentes, na oferta correspondente
			// Precisamos de ano, semestre, id_curso correspondentes ao TCC
			const tcc = await model.TrabalhoConclusao.findOne({
				where: { id: id_tcc },
			});
			if (!tcc) {
				throw new Error("TCC não encontrado");
			}

			// Calcular horários anterior e posterior
			const horaAnterior = calcularHorarioAnterior(hora);
			const horaPosterior = calcularHorarioPosterior(hora);

			const removerParaDocente = async (codigo) => {
				// Remover disponibilidade do horário escolhido
				await model.DocenteDisponibilidadeBanca.destroy({
					where: {
						ano: tcc.ano,
						semestre: tcc.semestre,
						id_curso: tcc.id_curso,
						fase: tcc.fase,
						codigo_docente: codigo,
						data_defesa: data,
						hora_defesa: hora,
					},
					transaction: t,
				});

				// Remover disponibilidade do horário anterior se existir
				if (horaAnterior) {
					await model.DocenteDisponibilidadeBanca.destroy({
						where: {
							ano: tcc.ano,
							semestre: tcc.semestre,
							id_curso: tcc.id_curso,
							fase: tcc.fase,
							codigo_docente: codigo,
							data_defesa: data,
							hora_defesa: horaAnterior,
						},
						transaction: t,
					});
				}

				// Remover disponibilidade do próximo horário se existir
				if (horaPosterior) {
					await model.DocenteDisponibilidadeBanca.destroy({
						where: {
							ano: tcc.ano,
							semestre: tcc.semestre,
							id_curso: tcc.id_curso,
							fase: tcc.fase,
							codigo_docente: codigo,
							data_defesa: data,
							hora_defesa: horaPosterior,
						},
						transaction: t,
					});
				}
			};

			await removerParaDocente(codigo_orientador);
			await removerParaDocente(membros_banca[0]);
			await removerParaDocente(membros_banca[1]);

			await t.commit();
			return res.status(201).json({
				message: "Defesa agendada com sucesso",
				horarioAnteriorRemovido: horaAnterior ? true : false,
				horarioPosteriorRemovido: horaPosterior ? true : false,
			});
		} catch (error) {
			await t.rollback();
			console.error("Erro ao agendar defesa:", error);
			return res.status(500).json({
				message: "Erro ao agendar defesa",
				error: error.message,
			});
		}
	},
);

// POST /api/defesas - Criar nova defesa simples
router.post(
	"/",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.CRIAR]),
	defesaService.criaDefesa,
);

// POST /api/defesas/gerenciar-banca - Gerenciar banca de defesa com convites em transação única
router.post(
	"/gerenciar-banca",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.CRIAR, Permissoes.TRABALHO_CONCLUSAO.EDITAR]),
	defesaService.gerenciarBancaDefesa,
);

// PUT /api/defesas/:id_tcc/:membro_banca
router.put(
	"/:id_tcc/:membro_banca",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.EDITAR]),
	defesaService.atualizaDefesa,
);

// DELETE /api/defesas/:id_tcc/:membro_banca/:fase
router.delete(
	"/:id_tcc/:membro_banca/:fase",
	auth.autenticarUsuario,
	autorizacao.verificarPermissao([Permissoes.TRABALHO_CONCLUSAO.DELETAR]),
	defesaService.deletaDefesa,
);

module.exports = router;

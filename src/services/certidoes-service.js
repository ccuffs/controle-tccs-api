const certidoesRepository = require("../repository/certidoes-repository");

// Função para listar certidões do docente
const listarCertidoes = async (req, res) => {
	try {
		// Obter ID do usuário autenticado
		const idUsuario = req.usuario?.id;

		if (!idUsuario) {
			console.log("listarCertidoes - usuário não autenticado");
			return res.status(400).json({
				message: "Usuário não autenticado"
			});
		}

		const { curso, ano, semestre, fase } = req.query;

		const filtros = {
			...(curso && { id_curso: parseInt(curso) }),
			...(ano && { ano: parseInt(ano) }),
			...(semestre && { semestre: parseInt(semestre) }),
			...(fase && { fase: parseInt(fase) })
		};

		// Buscar certidões, anos e semestres em paralelo
		const [certidoes, anosDisponiveis, semestresDisponiveis] = await Promise.all([
			certidoesRepository.buscarCertidoes(idUsuario, filtros),
			certidoesRepository.buscarAnosDisponiveis(idUsuario),
			certidoesRepository.buscarSemestresDisponiveis(idUsuario)
		]);

		res.status(200).json({
			certidoes,
			anosDisponiveis,
			semestresDisponiveis,
			total: certidoes.length
		});

	} catch (error) {
		console.error("Erro ao buscar certidões:", error);
		res.status(500).json({
			message: "Erro interno do servidor ao buscar certidões"
		});
	}
};

module.exports = {
	listarCertidoes
};

const certidoesRepository = require("../repository/certidoes-repository");
const fs = require('fs').promises;
const path = require('path');

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

// Função para gerar HTML da certidão
const gerarCertidao = async (req, res) => {
	try {
		const idUsuario = req.usuario?.id;
		const { idTcc, tipoParticipacao } = req.params;

		if (!idUsuario) {
			console.log("gerarCertidao - usuário não autenticado");
			return res.status(400).json({
				message: "Usuário não autenticado"
			});
		}

		if (!idTcc || !tipoParticipacao) {
			return res.status(400).json({
				message: "ID do TCC e tipo de participação são obrigatórios"
			});
		}

		// Buscar dados da certidão
		const dadosCertidao = await certidoesRepository.buscarDadosCertidao(
			idUsuario,
			parseInt(idTcc),
			tipoParticipacao
		);

		if (!dadosCertidao) {
			return res.status(404).json({
				message: "Certidão não encontrada ou usuário não autorizado"
			});
		}

		// Gerar HTML da certidão
		const htmlCertidao = await gerarHtmlCertidao(dadosCertidao);

		// Retornar HTML
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.send(htmlCertidao);

	} catch (error) {
		console.error("Erro ao gerar certidão:", error);
		res.status(500).json({
			message: "Erro interno do servidor ao gerar certidão"
		});
	}
};

// Função auxiliar para gerar o HTML da certidão
const gerarHtmlCertidao = async (dados) => {
	try {
		// Determinar qual template usar
		const nomeTemplate = dados.foi_orientador
			? 'declaracaoorientacoesTCCs.html'
			: 'declaracaobancasTCCs.html';

		// Caminho para o template
		const caminhoTemplate = path.join(__dirname, '..', 'reports', nomeTemplate);

		// Ler o template
		const templateHtml = await fs.readFile(caminhoTemplate, 'utf8');

		// Obter data atual
		const dataAtual = new Date();
		const dia = dataAtual.getDate();
		const mes = obterNomeMes(dataAtual.getMonth());
		const ano = dataAtual.getFullYear();

		// Mapear fase para descrição
		const faseDescricao = obterDescricaoFase(dados.fase);

		// Converter imagens para base64
		const logoBase64 = await converterImagemParaBase64(path.join(__dirname, '..', 'reports', 'logo.png'));
		const coordenadorBase64 = await converterImagemParaBase64(path.join(__dirname, '..', 'reports', 'coordenador.png'));

		// Substituir placeholders
		let htmlPreenchido = templateHtml
			.replace(/#docente#/g, dados.nome_docente)
			.replace(/#numSIAPE#/g, dados.siape_docente)
			.replace(/#tccFase#/g, faseDescricao)
			.replace(/#nomeAluno#/g, dados.nome_dicente)
			.replace(/#anoSemestre#/g, `${dados.ano}/${dados.semestre}`)
			.replace(/#tituloTcc#/g, dados.titulo_tcc)
			.replace(/#nomeCoordenador#/g, dados.nome_coordenador)
			.replace(/#nomeCurso#/g, dados.nome_curso)
			.replace(/#numSIAPECoordenador#/g, dados.siape_coordenador)
			.replace(/#diaem#/g, dia)
			.replace(/#mesem#/g, mes)
			.replace(/#anoem#/g, ano)
			// Substituir referências de imagens por base64
			.replace(/src="logo\.png"/g, `src="${logoBase64}"`)
			.replace(/src="coordenador\.png"/g, `src="${coordenadorBase64}"`)
			.replace(/src="images\/image2\.png"/g, 'style="display: none;"'); // Ocultar image2 que não existe

		// Para certidões de banca, adicionar informações específicas (data e hora da defesa)
		if (!dados.foi_orientador) {
			let dataDefesa = 'data a ser definida';
			let horaDefesa = 'horário a definir';

			if (dados.data_defesa) {
				const dataDefesaObj = new Date(dados.data_defesa);
				dataDefesa = dataDefesaObj.toLocaleDateString('pt-BR');
				horaDefesa = dataDefesaObj.toLocaleTimeString('pt-BR', {
					hour: '2-digit',
					minute: '2-digit'
				});
			}

			htmlPreenchido = htmlPreenchido
				.replace(/#dataDefesa#/g, dataDefesa)
				.replace(/#horaDefesa#/g, horaDefesa);
		}

		return htmlPreenchido;

	} catch (error) {
		console.error('Erro ao gerar HTML da certidão:', error);
		throw error;
	}
};

// Função auxiliar para obter nome do mês
const obterNomeMes = (numeroMes) => {
	const meses = [
		'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
		'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
	];
	return meses[numeroMes] || 'mês inválido';
};

// Função auxiliar para obter descrição da fase
const obterDescricaoFase = (fase) => {
	const fases = {
		0: 'Orientação',
		1: 'Projeto',
		2: 'TCC'
	};
	return fases[fase] || `Fase ${fase}`;
};

// Função auxiliar para converter imagem para base64
const converterImagemParaBase64 = async (caminhoImagem) => {
	try {
		const imagemBuffer = await fs.readFile(caminhoImagem);
		const base64 = imagemBuffer.toString('base64');
		const extensao = path.extname(caminhoImagem).toLowerCase();

		let mimeType;
		switch (extensao) {
			case '.png':
				mimeType = 'image/png';
				break;
			case '.jpg':
			case '.jpeg':
				mimeType = 'image/jpeg';
				break;
			case '.gif':
				mimeType = 'image/gif';
				break;
			default:
				mimeType = 'image/png';
		}

		return `data:${mimeType};base64,${base64}`;
	} catch (error) {
		console.error('Erro ao converter imagem para base64:', error);
		// Retornar um pixel transparente como fallback
		return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
	}
};

module.exports = {
	listarCertidoes,
	gerarCertidao
};

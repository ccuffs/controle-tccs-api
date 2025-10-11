# Controle TCCs API

API REST para gerenciamento de Trabalhos de Conclusão de Curso (TCCs) da UFFS.

## Descrição

Sistema backend para controle e gestão de TCCs, incluindo gerenciamento de orientações, bancas examinadoras, defesas, convites, disponibilidades e declarações. A aplicação oferece suporte completo ao fluxo de trabalho de TCCs, desde a proposta inicial até a defesa final.

## Tecnologias

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Passport JWT (autenticação)
- Helmet (segurança)
- Morgan (logs)
- Multer (upload de arquivos)

## Pré-requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL
- Yarn ou npm

## Instalação

```bash
yarn install
```

ou

```bash
npm install
```

## Configuração

1. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:

```env
SERVERPORT=porta_servidor
DBHOST=endereco_postgres
DBPORT=porta_postgres
DBNAME=nome_banco
DBUSER=usuario_banco
DBPASS=sua_senha
JWT_SECRET=sua_chave_secreta
```

2. Busque o script SQL para criar a estrutura do banco de dados utilizando a extensão ERD Editor  em database.erd.json e execute no banco de dados.


## Execução

Para iniciar o servidor:

```bash
nodemon src/server.js
```

O servidor estará disponível em `http://localhost:3010`

## Estrutura do Projeto

```
src/
├── config/          # Configurações de conexão
├── controllers/     # Controladores das rotas
├── middleware/      # Middleware de autenticação e autorização
├── models/          # Modelos Sequelize
├── repository/      # Camada de acesso a dados
├── services/        # Lógica de negócio
├── enums/           # Enumerações e constantes
├── public/          # Arquivos estáticos
└── server.js        # Arquivo principal do servidor
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/refresh` - Renovar token

### Docentes
- `GET /api/docentes` - Listar docentes
- `POST /api/docentes` - Criar docente
- `PUT /api/docentes/:id` - Atualizar docente
- `DELETE /api/docentes/:id` - Remover docente

### Dicentes
- `GET /api/dicentes` - Listar dicentes
- `POST /api/dicentes` - Criar dicente
- `PUT /api/dicentes/:id` - Atualizar dicente
- `DELETE /api/dicentes/:id` - Remover dicente

### Orientações
- `GET /api/orientacoes` - Listar orientações
- `POST /api/orientacoes` - Criar orientação
- `PUT /api/orientacoes/:id` - Atualizar orientação
- `DELETE /api/orientacoes/:id` - Remover orientação

### Defesas
- `GET /api/defesas` - Listar defesas
- `POST /api/defesas` - Agendar defesa
- `PUT /api/defesas/:id` - Atualizar defesa
- `DELETE /api/defesas/:id` - Cancelar defesa

### Convites
- `GET /api/convites` - Listar convites
- `POST /api/convites` - Criar convite
- `PUT /api/convites/:id` - Atualizar convite
- `DELETE /api/convites/:id` - Remover convite

### Disponibilidade de Banca
- `GET /api/disponibilidade-banca` - Listar disponibilidades
- `POST /api/disponibilidade-banca` - Registrar disponibilidade
- `PUT /api/disponibilidade-banca/:id` - Atualizar disponibilidade
- `DELETE /api/disponibilidade-banca/:id` - Remover disponibilidade

### Dashboard
- `GET /api/dashboard/estatisticas` - Obter estatísticas gerais

### Declarações
- `GET /api/declaracoes` - Gerar declarações

## Autenticação

A API utiliza autenticação JWT (JSON Web Token) via Passport. Para acessar endpoints protegidos, inclua o token no header da requisição:

```
Authorization: Bearer seu_token_jwt
```

## Autorização

O sistema implementa controle de permissões baseado em grupos e categorias. Verifique o código em `src/middleware/` para mais detalhes.

## Licença

MIT

## Autor(s)

Giancarlo Salton - gian@uffs.edu.br

## Repositório

https://github.com/ccuffs/controle-tccs-api

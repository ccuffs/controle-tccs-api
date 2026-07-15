# Etapa base
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas arquivos de dependência (melhor cache)
COPY package*.json yarn.lock ./

# Instala as dependências (inclui devDependencies, necessárias para o build do Nest)
RUN yarn install

# Copia o restante do código
COPY . .

# Compila o TypeScript para dist/
RUN yarn build

# Define variáveis de ambiente padrão de produção
ENV NODE_ENV=production
ENV PORT=5001

# Expondo a porta
EXPOSE 5001

# Cria usuário não-root para segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Comando de inicialização
CMD ["node", "dist/main.js"]
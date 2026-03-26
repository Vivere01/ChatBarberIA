FROM node:20-alpine
# VERSION-V5
WORKDIR /app

# Instalar dependências necessárias para o Prisma rodar no Alpine e configurar Engine Node-API
RUN apk add --no-cache openssl libc6-compat
ENV PRISMA_CLIENT_ENGINE_TYPE=library
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library

# 1. Instalar as dependências e ferramentas
COPY package.json package-lock.json ./
RUN npm ci

# 2. Copiar os arquivos do projeto
COPY . .

# 3. Gerar o Prisma e fazer o build do Next.js dentro do container
RUN npx prisma generate
RUN npm run build

# --- ESTÁGIO DE EXECUÇÃO ---
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Loop para aguardar o banco de dados ficar pronto antes de iniciar o app
CMD until npx prisma db push; do echo "Aguardando banco de dados..." && sleep 2; done && npm run start

FROM node:20-alpine
# VERSION-V4
WORKDIR /app

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

# Garantimos que as tabelas sejam criadas no banco antes de subir o sistema
CMD npx prisma db push && npm run start

FROM node:20-alpine

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
# Quando usamos output: "standalone", o Next cria uma pasta otimizada
# Precisamos rodar o server.js gerado lá dentro.
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Standalone mode requires running from .next/standalone
CMD ["node", ".next/standalone/server.js"]

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
ENV NODE_ENV=production
ENV PORT=3000

# Standalone mode requires public and static folders to be copied manually
RUN cp -r public .next/standalone/public
RUN mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]

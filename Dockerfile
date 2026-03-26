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

# Movemos os arquivos do standalone para a raiz para facilitar caminhos
RUN cp -r .next/standalone/. .
RUN cp -r .next/static ./.next/static
RUN cp -r public ./public

EXPOSE 3000

# Agora rodamos o server.js que está na raiz
CMD ["node", "server.js"]

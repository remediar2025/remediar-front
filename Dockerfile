# Imagem base
FROM node:18-bullseye

# Diretório de trabalho
WORKDIR /app

# Variáveis de ambiente - colocar antes do npm install!
ENV NEXT_PUBLIC_API_URL=https://remediar-api.mgioqc.easypanel.host/api
ENV NEXT_PUBLIC_API_BASE_URL=https://remediar-api.mgioqc.easypanel.host/api
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV TAILWIND_MODE=build
ENV TAILWIND_DISABLE_OXIDE=true
ENV CI=true
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install --legacy-peer-deps

# Copia o restante do projeto
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando para iniciar o app
CMD ["npm", "start"]

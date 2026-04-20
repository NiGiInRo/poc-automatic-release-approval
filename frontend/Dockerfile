# Etapa 1: compilar el Angular
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir los estáticos con nginx
FROM nginx:alpine
COPY --from=builder /app/dist/releases-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

FROM nginx:alpine

# Copia a configuração personalizada do Nginx com suporte a múltiplos subdomínios
COPY nginx.conf /etc/nginx/nginx.conf

# Copia os arquivos estáticos do painel (HTML, CSS, JS) para o diretório padrão do Nginx
COPY . /usr/share/nginx/html/

# Expõe a porta HTTP padrão
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

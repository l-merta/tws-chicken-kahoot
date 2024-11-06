# Base image
FROM node:20.18.0

# Nastavení pracovního adresáře
WORKDIR /app

# Zkopírování balíčků a instalace závislostí pro React
COPY client/package*.json ./client/
RUN cd client && npm install

# Zkopírování celé React aplikace a její kompilace
COPY client ./client
RUN cd client && npm run build

# Zkopírování balíčků a instalace závislostí pro Express
COPY server/package*.json ./server/
RUN cd server && npm install

# Přesun kompilovaných souborů z Reactu do veřejné složky serveru
RUN mkdir -p server/public && cp -r client/dist/* server/public/
#RUN cp -r client/dist/* server/

# Zkopírování celé serverové aplikace
COPY server ./server

# Nastavení pracovního adresáře na server a spuštění Express serveru
WORKDIR /app/server
CMD ["npm", "run", "dev"]
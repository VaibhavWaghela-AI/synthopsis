FROM node:20-slim

# Install Chromium and fonts for Puppeteer headless browser
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       curl \
       chromium \
       fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=3006
ENV ORCHESTRATOR_URL=http://backend:8000/whatsapp-incoming

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3006/status || exit 1

CMD ["npm", "start"]

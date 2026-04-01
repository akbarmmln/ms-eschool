FROM node:18-bullseye

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libxss1 \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libnss3 \
    libasound2 \
    libxshmfence1 \
    libxrandr2 \
    xdg-utils \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Asia/Jakarta /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV TZ=Asia/Jakarta
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

USER root
EXPOSE 8998

CMD ["npm", "start"]
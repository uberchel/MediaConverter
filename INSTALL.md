# 📦 Руководство по установке

## Системные требования

- **Node.js** версии 16.0.0 или выше
- **FFmpeg** версии 4.0 или выше
- **npm** или **yarn** для управления зависимостями

## 🚀 Быстрая установка

### 1. Установка FFmpeg

#### Windows
```bash
choco install ffmpeg
```

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
ffmpeg -version
```

### 2. Установка Node.js

#### Windows
```bash
choco install nodejs
```

#### macOS
```bash
brew install node
```

#### Linux
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Клонирование и установка проекта

```bash
# Клонирование репозитория
git clone https://github.com/yourusername/video-converter-queue-manager.git
cd video-converter-queue-manager

# Установка зависимостей
npm install

# Создание необходимых директорий
mkdir -p uploads/tmp uploads/converted

# Компиляция TypeScript
npm run build
```

## 🔧 Проверка установки

### Проверка FFmpeg
```bash
ffmpeg -version
```

### Проверка Node.js
```bash
node --version
npm --version
```

### Проверка проекта
```bash
# Запуск тестового примера
node dist/index.js
```

## ⚙️ Конфигурация

### Пример использования MediaConverter

```typescript
import MediaConverter from "./index.js";

const conv = new MediaConverter({
    dir: "./uploads",
    eventURL: "http://localhost/api/"
});

conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "high"
});
```

### Настройка директорий

```typescript
conv.convert({
    format: "mp4",
    inputFile: "video.mp4"
});
```

## 🐛 Устранение проблем

### Ошибка "FFmpeg not found"
```bash
which ffmpeg
export PATH=$PATH:/path/to/ffmpeg/bin
```

### Ошибка "Permission denied"
```bash
chmod +x /path/to/ffmpeg
```

### Ошибка "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Ошибка "TypeScript compilation failed"
```bash
npm install -g typescript
npx tsc --version
```

## 🚀 Запуск в продакшене

### Использование PM2
```bash
npm install -g pm2
pm2 start dist/index.js --name "media-converter"
pm2 status
pm2 logs media-converter
pm2 startup
pm2 save
```

### Использование Docker
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Использование systemd
```ini
[Unit]
Description=MediaConverter
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/video-converter-queue-manager
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

sudo systemctl enable media-converter
sudo systemctl start media-converter
sudo systemctl status media-converter 
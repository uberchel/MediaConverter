# 🎬 MediaConverter
Конвертер видео и аудио файлов с менеджером очереди и с поддержкой множественных форматов, уровней качества и гибкими настройками кодирования.

## ✨ Основные возможности

### 🎯 **Уровни качества**
- **Low** - быстрое кодирование, маленький размер файла
- **Medium** - баланс между качеством и размером (по умолчанию)
- **High** - высокое качество, больший размер файла
- **Ultra** - максимальное качество, очень большой размер файла

### 📹 **Поддерживаемые форматы**

#### Видео форматы:
- **MP4** - универсальный формат, совместим со всеми устройствами
- **AVI** - классический формат, хорошая совместимость
- **MKV** - контейнер с поддержкой множественных дорожек
- **WebM** - современный веб-формат, оптимизирован для интернета
- **MOV** - формат Apple, совместим с устройствами Apple
- **FLV** - Flash Video, для веб-приложений
- **WMV** - Windows Media Video
- **M4V** - iTunes совместимый формат

#### Аудио форматы:
- **MP3** - популярный аудио формат
- **WAV** - аудио без потерь
- **AAC** - высококачественный аудио кодек
- **OGG** - открытый аудио формат
- **FLAC** - аудио без потерь
- **WMA** - Windows Media Audio
- **M4A** - iTunes совместимый аудио формат

### 🔧 **Дополнительные функции**
- **Автоматическая очередь** конвертации
- **Хеширование имен файлов** для уникальности
- **Настройка размера видео** (разрешение)
- **Настройка соотношения сторон** (aspect ratio)
- **Прогресс конвертации** в реальном времени
- **События конвертации** (start, progress, complete, error)
- **Гибкие настройки битрейтов** и кодеков

## 🚀 Установка

### Предварительные требования
- Node.js 16+ 
- FFmpeg (установленный в системе)

### Установка FFmpeg

#### Windows:
```bash
# Скачать с официального сайта
# https://ffmpeg.org/download.html
# Или через chocolatey:
choco install ffmpeg
```

#### macOS:
```bash
# Через Homebrew
brew install ffmpeg
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

### Установка зависимостей проекта
```bash
# Клонирование репозитория
git clone https://github.com/uberchel/MediaConverter.git
cd MediaConverter

# Установка зависимостей
npm install
```

## 📦 Зависимости

```json
{
  "fluent-ffmpeg": "^2.1.2",
  "music-metadata": "^7.13.0",
  "ip": "^1.1.8",
  "md5": "^2.3.0"
}
```

## 🎮 Использование

### Базовое использование

```typescript
import MediaConverter from "./index.js";

const conv = new MediaConverter({
    dir: "./uploads",
    eventURL: "http://localhost/api/"
});

conv.convert({
    format: "mp4",
    inputFile: "1.mp4"
});
```

### Примеры с разными уровнями качества

```typescript
// Низкое качество (быстрое кодирование)
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "low"
});

// Высокое качество
conv.convert({
    format: "mkv",
    inputFile: "video.mp4",
    quality: "high"
});

// Ультра качество
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "ultra"
});
```

### Примеры с разными форматами

```typescript
// WebM для веб
conv.convert({
    format: "webm",
    inputFile: "video.mp4",
    quality: "medium"
});

// MKV с высоким качеством
conv.convert({
    format: "mkv",
    inputFile: "video.mp4",
    quality: "high"
});

// Аудио конвертация
conv.convert({
    format: "mp3",
    inputFile: "audio.wav",
    quality: "high"
});
```

### Продвинутые настройки

```typescript
// Кастомный размер видео
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "high",
    size: "1920x1080"
});

// Кастомное соотношение сторон
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "high",
    aspect: "16:9"
});

// Кастомные битрейты (переопределяют качество)
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "high",
    videoBitrate: 2048,
    audioBitrate: 320
});

// Кастомные кодеки
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "high",
    videoCodec: "libx265",
    audioCodec: "aac"
});
```

### Получение информации о доступных опциях

```typescript
// Получить доступные уровни качества
console.log(conv.converter.getQualityLevels());

// Получить доступные форматы
console.log(conv.converter.getAvailableFormats());
```

## 📁 Структура проекта

```
src/
├── convQueueManager.mts    # Основной класс менеджера очереди
├── eventSender.js          # Отправка событий конвертации
├── index.ts                # Основной файл Конвертера
└── types.ts                # TypeScript типы (если есть)

uploads/
├── tmp/                   # Временные файлы для конвертации
└── converted/             # Конвертированные файлы
    └── YYYY-MM-DD/        # Файлы по датам
```

## ⚙️ Конфигурация

### Уровни качества и их настройки

| Качество | Видео битрейт | Аудио битрейт | CRF | Пресет | Описание |
|----------|---------------|---------------|-----|--------|----------|
| Low      | ×0.5          | ×0.5          | 28  | fast   | Быстрое кодирование |
| Medium   | ×1.0          | ×1.0          | 23  | medium | Баланс качества/размера |
| High     | ×1.5          | ×1.2          | 18  | slow   | Высокое качество |
| Ultra    | ×2.0          | ×1.5          | 15  | veryslow | Максимальное качество |

### Форматы и их кодеки

| Формат | Видео кодек | Аудио кодек | Базовый видео битрейт | Базовый аудио битрейт |
|--------|-------------|-------------|----------------------|----------------------|
| MP4    | libx264     | aac         | 1200 kbps           | 320 kbps            |
| MKV    | libx264     | aac         | 1500 kbps           | 320 kbps            |
| WebM   | libvpx-vp9  | libopus     | 1000 kbps           | 128 kbps            |
| AVI    | libx264     | libmp3lame  | 1200 kbps           | 320 kbps            |
| MP3    | copy        | libmp3lame  | -                   | 320 kbps            |
| FLAC   | copy        | flac        | -                   | 0 (без потерь)      |

## 🔄 События конвертации

Система отправляет события через EventSender:

- **queue** - файл добавлен в очередь
- **start** - начало конвертации
- **progress** - прогресс конвертации (с процентами)
- **complete** - завершение конвертации
- **error** - ошибка конвертации

## 🚀 Запуск

### Разработка
```bash
# Компиляция TypeScript
npm run build

# Запуск
npm start
```

### Продакшн
```bash
# Установка зависимостей
npm install --production

# Запуск
node dist/index.js
```

## 📝 Пример полного использования

```typescript
import MediaConverter from "./index.js";

const conv = new MediaConverter({
    dir: "./uploads",
    eventURL: "http://localhost:3000/api/"
});

const videos = [
    { file: "movie.mp4", format: "mp4", quality: "high" },
    { file: "clip.mp4", format: "webm", quality: "medium" },
    { file: "presentation.mp4", format: "mp4", quality: "low", size: "1280x720" },
    { file: "music.wav", format: "mp3", quality: "high" }
];

videos.forEach(video => {
    conv.convert({
        format: video.format,
        inputFile: video.file,
        quality: video.quality,
        size: video.size
    });
});

console.log("Доступные качества:", conv.converter.getQualityLevels());
console.log("Доступные форматы:", conv.converter.getAvailableFormats());
```

## 🐛 Устранение неполадок

### Ошибка "FFmpeg not found"
```bash
# Проверьте установку FFmpeg
ffmpeg -version

# Добавьте FFmpeg в PATH или укажите путь в коде
ffmpeg.setFfmpegPath('/path/to/ffmpeg');
```

### Ошибка "Output format not available"
- Убедитесь, что FFmpeg поддерживает нужный формат
- Проверьте правильность названия формата
- Попробуйте использовать базовые форматы (mp4, avi, mp3)
- Откатите версию __FFMpeg__, так как с 7 версии есть изменения в при рендере данных, а в __fluent-ffmpeg__ это не реализовано. Либо вы можете скачать из папки fix файл с изменениями и заменить его по пути ***\node_modules\fluent-ffmpeg\lib\capabilities.js***

### Медленная конвертация
- Используйте качество "low" для быстрой конвертации
- Уменьшите битрейты
- Используйте более быстрые пресеты

## 📄 Лицензия

MIT License

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте Issue в репозитории.



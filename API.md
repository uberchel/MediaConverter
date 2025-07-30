# 📚 API Документация

## 🏗️ Архитектура

MediaConverter — основной публичный API для управления очередью конвертации видео и аудио файлов.

- **`MediaConverter`** — основной класс для работы с конвертацией
- **`convert`** — основной метод для добавления задачи

## 📦 Основной класс

### `MediaConverter`

#### Конструктор
```typescript
constructor(options: MediaConverterOptions)
```

**Параметры:**
- `options.dir` — директория для файлов (например, './uploads')
- `options.eventURL?` — URL для отправки событий (опционально)

**Пример:**
```typescript
import MediaConverter from "./index.js";

const conv = new MediaConverter({
    dir: "./uploads",
    eventURL: "http://localhost/api/"
});
```

#### Метод: `convert`

```typescript
convert(options: ConversionTask): void
```

**Параметры:**
- `options.inputFile` — имя входного файла (обязательно)
- `options.format` — целевой формат (например, 'mp4', 'webm', 'mp3', ...)
- `options.size?` — размер видео (например, '1920x1080')
- `options.aspect?` — соотношение сторон (например, '16:9')
- `options.quality?` — уровень качества ('low' | 'medium' | 'high' | 'ultra')
- `options.videoCodec?` — видео кодек (например, 'libx264')
- `options.audioCodec?` — аудио кодек (например, 'aac')
- `options.videoBitrate?` — видео битрейт (kbps)
- `options.audioBitrate?` — аудио битрейт (kbps)

**Пример:**
```typescript
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "high",
    size: "1920x1080"
});
```

#### Получение информации о качествах и форматах

```typescript
conv.converter.getQualityLevels(); // Информация о доступных уровнях качества
conv.converter.getAvailableFormats(); // Информация о поддерживаемых форматах
```

## 🎯 Уровни качества

| Уровень | Описание | Видео битрейт | Аудио битрейт | CRF | Пресет |
|---------|----------|---------------|---------------|-----|--------|
| `low` | Быстрое кодирование | ×0.5 | ×0.5 | 28 | fast |
| `medium` | Баланс качества/размера | ×1.0 | ×1.0 | 23 | medium |
| `high` | Высокое качество | ×1.5 | ×1.2 | 18 | slow |
| `ultra` | Максимальное качество | ×2.0 | ×1.5 | 15 | veryslow |

**Пример:**
```typescript
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    quality: "low"
});
```

## 📹 Поддерживаемые форматы

| Формат | Видео кодек | Аудио кодек | Базовый видео битрейт | Базовый аудио битрейт | Описание |
|--------|-------------|-------------|----------------------|----------------------|----------|
| `mp4` | libx264 | aac | 1200 kbps | 320 kbps | Универсальный формат |
| `mkv` | libx264 | aac | 1500 kbps | 320 kbps | Контейнер с множественными дорожками |
| `webm` | libvpx-vp9 | libopus | 1000 kbps | 128 kbps | Веб-оптимизированный |
| `avi` | libx264 | libmp3lame | 1200 kbps | 320 kbps | Классический формат |
| `mov` | libx264 | aac | 1200 kbps | 320 kbps | Apple совместимый |
| `flv` | libx264 | aac | 800 kbps | 256 kbps | Flash Video |
| `wmv` | wmv2 | wmav2 | 800 kbps | 256 kbps | Windows Media |
| `m4v` | libx264 | aac | 1200 kbps | 320 kbps | iTunes совместимый |
| `mp3` | copy | libmp3lame | - | 320 kbps | Популярный аудио формат |
| `wav` | copy | pcm_s16le | - | 1411 kbps | Аудио без потерь |
| `aac` | copy | aac | - | 256 kbps | Высококачественный аудио |
| `ogg` | copy | libvorbis | - | 192 kbps | Открытый аудио формат |
| `flac` | copy | flac | - | 0 (без потерь) | Аудио без потерь |
| `wma` | copy | wmav2 | - | 256 kbps | Windows Media Audio |
| `m4a` | copy | aac | - | 256 kbps | iTunes совместимый аудио |

## 🔧 Продвинутые настройки

```typescript
// Кастомные битрейты (игнорируют качество)
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    videoBitrate: 2048,
    audioBitrate: 320
});

// Кастомные кодеки
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    videoCodec: "libx265",
    audioCodec: "aac"
});

// Кастомный размер и соотношение сторон
conv.convert({
    format: "mp4",
    inputFile: "video.mp4",
    size: "1280x720",
    aspect: "16:9"
});
```

## 📊 События

События отправляются автоматически, если указан eventURL. Типы событий: queue, start, progress, complete, error.

## 📝 Пример интеграции

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
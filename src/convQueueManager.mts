/**
 * imports modules
 */
import { EventSender } from "./eventSender.js";
import { parseFile } from "music-metadata";
import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs";
import ip from "ip";
import md5 from "md5";

/**
 * Quality levels for conversion
 */
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Quality presets with bitrate multipliers
 */
interface QualityPreset {
    videoBitrateMultiplier: number;
    audioBitrateMultiplier: number;
    crf?: number;
    preset?: string;
}

/**
 * Format configurations for different output formats
 */
interface FormatConfig {
    vc: string;
    ac: string;
    videoBitrate?: number;
    audioBitrate?: number;
}

/**
 * Interface of class convQueueManager
 */
export interface ConversionTask {
    inputFile: string;
    format: string;
    size?: string;
    aspect?: string;
    quality?: QualityLevel;
    videoCodec?: string;
    audioCodec?: string;
    videoBitrate?: number;
    audioBitrate?: number;
}

export interface MediaConverterOptions {
	dir: string;
	eventURL?: string;
}

/**
 * Class convQueueManager
 */
export class convQueueManager {

    /* dir */
    dir: string;
    /* date */
    date: any;
    /* hashed file name */
    hash: string;
    /* extension out file */
    extension: string;
    /* output file name */
    outputFile: string;
    /* conversion task array */
    queue: ConversionTask[];
    /* current converting check */
    converting: boolean;
    /* module  EventSender (fetch API)*/
    eventSender: EventSender;
    /* default presets for different formats */
    formats: Record<string, FormatConfig>;
    /* quality presets */
    qualityPresets: Record<QualityLevel, QualityPreset>;

    constructor(options: MediaConverterOptions) {
        this.queue = [];
        this.date = new Date();
        this.converting = false;
        this.dir = options.dir ?? './uploads';
        
        if (options.eventURL) {
            this.eventSender = new EventSender(options.eventURL);
        }
        
        // Quality presets
        this.qualityPresets = {
            low: {
                videoBitrateMultiplier: 0.5,
                audioBitrateMultiplier: 0.5,
                crf: 28,
                preset: 'fast'
            },
            medium: {
                videoBitrateMultiplier: 1.0,
                audioBitrateMultiplier: 1.0,
                crf: 23,
                preset: 'medium'
            },
            high: {
                videoBitrateMultiplier: 1.5,
                audioBitrateMultiplier: 1.2,
                crf: 18,
                preset: 'slow'
            },
            ultra: {
                videoBitrateMultiplier: 2.0,
                audioBitrateMultiplier: 1.5,
                crf: 15,
                preset: 'veryslow'
            }
        };
        
        this.formats = {
            // Video formats
            mp4: {
                vc: 'libx264',
                ac: 'aac',
                videoBitrate: 1200,
                audioBitrate: 320,
            },
            avi: {
                vc: 'libx264',
                ac: 'libmp3lame',
                videoBitrate: 1200,
                audioBitrate: 320,
            },
            mkv: {
                vc: 'libx264',
                ac: 'aac',
                videoBitrate: 1500,
                audioBitrate: 320,
            },
            webm: {
                vc: 'libvpx-vp9',
                ac: 'libopus',
                videoBitrate: 1000,
                audioBitrate: 128,
            },
            mov: {
                vc: 'libx264',
                ac: 'aac',
                videoBitrate: 1200,
                audioBitrate: 320,
            },
            flv: {
                vc: 'libx264',
                ac: 'aac',
                videoBitrate: 800,
                audioBitrate: 256,
            },
            wmv: {
                vc: 'wmv2',
                ac: 'wmav2',
                videoBitrate: 800,
                audioBitrate: 256,
            },
            m4v: {
                vc: 'libx264',
                ac: 'aac',
                videoBitrate: 1200,
                audioBitrate: 320,
            },
            // Audio formats
            mp3: {
                vc: 'copy',
                ac: 'libmp3lame',
                audioBitrate: 320,
            },
            wav: {
                vc: 'copy',
                ac: 'pcm_s16le',
                audioBitrate: 1411,
            },
            aac: {
                vc: 'copy',
                ac: 'aac',
                audioBitrate: 256,
            },
            ogg: {
                vc: 'copy',
                ac: 'libvorbis',
                audioBitrate: 192,
            },
            flac: {
                vc: 'copy',
                ac: 'flac',
                audioBitrate: 0, // Lossless
            },
            wma: {
                vc: 'copy',
                ac: 'wmav2',
                audioBitrate: 256,
            },
            m4a: {
                vc: 'copy',
                ac: 'aac',
                audioBitrate: 256,
            },
            // High quality formats
            'mp4-hq': {
                vc: 'libx265',
                ac: 'aac',
                videoBitrate: 2000,
                audioBitrate: 320,
            },
            'mkv-hq': {
                vc: 'libx265',
                ac: 'flac',
                videoBitrate: 2500,
                audioBitrate: 0,
            },
            'webm-hq': {
                vc: 'libvpx-vp9',
                ac: 'libopus',
                videoBitrate: 1500,
                audioBitrate: 192,
            },
            // Mobile optimized
            'mp4-mobile': {
                vc: 'libx264',
                ac: 'aac',
                videoBitrate: 800,
                audioBitrate: 128,
            },
            'webm-mobile': {
                vc: 'libvpx',
                ac: 'libvorbis',
                videoBitrate: 600,
                audioBitrate: 96,
            }
        };
    }

    addToQueue(task: ConversionTask): void {
        this.queue.push(task);
        // Generate output filename with quality suffix
        const qualitySuffix = task.quality ? `-${task.quality}` : '';
        /* hashed name input file for output file */
        this.hash = md5(task.inputFile);
        /* parse extension for out file */
        this.extension = task.format.indexOf('-') > 0 ? task.format.split('-')[0] : task.format;
        /* output file name */
        this.outputFile =  `${this.hash}${qualitySuffix}.${this.extension}`;
        /* start task convertsion */
        this.eventSender?.sendQueueEvent(this.outputFile, task);

        /* If the conversion is completed */
        if (!this.converting) {
            this.convertNext();
        }
    }

    /**
     * Calculate bitrates based on quality preset
     */
    private calculateBitrates(task: ConversionTask): { videoBitrate: number; audioBitrate: number; crf: number; preset: string } {
        const quality = task.quality || 'medium';
        const qualityPreset = this.qualityPresets[quality];
        const formatConfig = this.formats[task.format];
        
        // Use task bitrates if provided, otherwise use format defaults
        const baseVideoBitrate = task.videoBitrate || formatConfig?.videoBitrate || 1200;
        const baseAudioBitrate = task.audioBitrate || formatConfig?.audioBitrate || 320;
        
        // Apply quality multipliers
        const videoBitrate = Math.round(baseVideoBitrate * qualityPreset.videoBitrateMultiplier);
        const audioBitrate = Math.round(baseAudioBitrate * qualityPreset.audioBitrateMultiplier);
        
        return {
            videoBitrate,
            audioBitrate,
            crf: qualityPreset.crf || 23,
            preset: qualityPreset.preset || 'medium'
        };
    }

    /**
     * Get available quality levels with descriptions
     */
    getQualityLevels(): Record<QualityLevel, { description: string; videoBitrateMultiplier: number; audioBitrateMultiplier: number }> {
        return {
            low: {
                description: 'Низкое качество - быстрое кодирование, маленький размер файла',
                videoBitrateMultiplier: this.qualityPresets.low.videoBitrateMultiplier,
                audioBitrateMultiplier: this.qualityPresets.low.audioBitrateMultiplier
            },
            medium: {
                description: 'Среднее качество - баланс между качеством и размером',
                videoBitrateMultiplier: this.qualityPresets.medium.videoBitrateMultiplier,
                audioBitrateMultiplier: this.qualityPresets.medium.audioBitrateMultiplier
            },
            high: {
                description: 'Высокое качество - лучшее качество, больший размер файла',
                videoBitrateMultiplier: this.qualityPresets.high.videoBitrateMultiplier,
                audioBitrateMultiplier: this.qualityPresets.high.audioBitrateMultiplier
            },
            ultra: {
                description: 'Ультра качество - максимальное качество, очень большой размер файла',
                videoBitrateMultiplier: this.qualityPresets.ultra.videoBitrateMultiplier,
                audioBitrateMultiplier: this.qualityPresets.ultra.audioBitrateMultiplier
            }
        };
    }

    /**
     * Get available formats with their default settings
     */
    getAvailableFormats(): Record<string, { description: string; videoCodec: string; audioCodec: string; defaultVideoBitrate: number; defaultAudioBitrate: number }> {
        const formatDescriptions: Record<string, string> = {
            mp4: 'Универсальный формат, совместим со всеми устройствами',
            avi: 'Классический формат, хорошая совместимость',
            mkv: 'Контейнер с поддержкой множественных дорожек',
            webm: 'Современный веб-формат, оптимизирован для интернета',
            mov: 'Формат Apple, совместим с устройствами Apple',
            flv: 'Flash Video, для веб-приложений',
            wmv: 'Windows Media Video',
            m4v: 'iTunes совместимый формат',
            mp3: 'Популярный аудио формат',
            wav: 'Аудио без потерь',
            aac: 'Высококачественный аудио кодек',
            ogg: 'Открытый аудио формат',
            flac: 'Аудио без потерь',
            wma: 'Windows Media Audio',
            m4a: 'iTunes совместимый аудио формат'
        };

        const result: Record<string, any> = {};
        for (const [format, config] of Object.entries(this.formats)) {
            result[format] = {
                description: formatDescriptions[format] || 'Неизвестный формат',
                videoCodec: config.vc,
                audioCodec: config.ac,
                defaultVideoBitrate: config.videoBitrate || 0,
                defaultAudioBitrate: config.audioBitrate || 0
            };
        }
        return result;
    }

    async convertNext(): Promise<void> {
        try {
            /* If there is no queue, shut down the work */
            if (this.queue.length === 0) {
                this.converting = false;
                return;
            }

            /* The queue is active */
            this.converting = true;

            /* We get the IP of our server */
            const addr = ip.address();

            /* we get the first queue and delete it from the array */
            const task = this.queue.shift();

            /* Creating a folder with the current date, without the clocke */
            const dateString = `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`;

            /* Generating the path to the folder with files for conversion */
            const inputDir = path.join(this.dir + "/tmp", task.inputFile);

            /* Generating the path to the folder with files after conversion */
            const outputDir = path.join(this.dir + "/converted", dateString);

            /* Checking the existence of the folder */
            if (!fs.existsSync(inputDir)) {
                console.log(`Directory not found: ${inputDir}`);
                return;
            }

            /* Check the existence of the folder, if it does not exist, create */
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, {
                    recursive: true,
                });
            }

            /* Getting metadata from a file */
            const metadata = await parseFile(inputDir);

            /* Full path to the converted file */
            const outputFilePath = path.join(outputDir, this.outputFile);

            /* Getting duration audio file */
            const duration = metadata.format.duration;

            /* Colculate percent progress converting */
            const colculatePercent = (duration: number, timeStamp: string, size: number): number => {
                if (size === 0) return size;
                let time = ((duration % 3600) / 62.5) % Math.ceil(duration % 60);
                let parse = timeStamp.match(/\d+:0?(\d+):(\d+)/im);
                let fTime = parse != null ? Number(parse[1] + "." + parse[2]) : 0;
                return Math.round((fTime * 100) / time);
            };
            
            /* Converting function */
            const bitrates = this.calculateBitrates(task);
            /* ffmpeg object */
            const convert = ffmpeg(inputDir);
            /* Size video  */
            if (task.size) convert.size(task.size);
            /* Aspect video */
            if (task.aspect) convert.size(task.aspect);
            /* Conversion */
            convert.outputOptions(["-movflags +faststart", `-preset ${bitrates.preset}`, `-crf ${bitrates.crf}`])
                .toFormat(this.extension)
                .videoCodec(task?.videoCodec ?? this.formats[task.format]?.vc ?? 'libx264')
                .audioCodec(task?.audioCodec ?? this.formats[task.format]?.ac ?? 'aac')
                .videoBitrate(bitrates.videoBitrate)
                .audioBitrate(bitrates.audioBitrate)

                /* Converting error */
                .on("error", async (err: Error) => {
                    console.log(`An error occurred: ${err.message}`);
                    await this.eventSender?.sendErrorEvent(this.hash, err.message);
                    this.convertNext();
                })

                /* Start converting */
                .on("start", async () => {
                    console.log(`Conversion start: ${this.outputFile}`);
                    await this.eventSender?.sendStartEvent(this.hash);
                    this.convertNext();
                })

                /* Converting progress percent */
                .on("progress", async (e, i) => {
                    console.log(`Conversion progress: ${this.outputFile}`);
                    /* Send progress of API backend panel */
                    await this.eventSender?.sendProgressEvent(this.hash, {
                        kbps: e.currentKbps,
                        size: e.targetSize,
                        timemark: e.timemark,
                        percent: colculatePercent(duration, e.timemark, +e.targetSize),
                    });
                })

                /* Converting complite */
                .on("end", async () => {
                    console.log("Conversion complete");
                    /* Send complete of API backend panel */
                    await this.eventSender?.sendCompleteEvent(this.hash, {
                        url: `https://${addr}/${outputFilePath}`,
                        name: this.outputFile,
                        title: metadata.common?.title || "",
                        album: metadata.common?.album || "",
                        artist: metadata.common?.artist || "",
                    });

                    /* Next  queue */
                    this.convertNext();
                })
                /* Save converted file */
                .save(outputFilePath);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

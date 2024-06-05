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
 * Interface of class convQueueManager
 */
interface ConversionTask {
    dir: string;
    inputFile: string;
    audioBitrate: number;
    codec: string;
}

/**
 * Class convQueueManager
 */
export class convQueueManager {
    /* date */
    date: any;
    /* hash file */
    hash: string;
    /* output file name */
    outputFile: string;
    /* conversion task array */
    queue: ConversionTask[];
    /* current converting check */
    converting: boolean;
    /* module  EventSender (fetch API)*/
    eventSender: EventSender;

    constructor(eventSender: EventSender) {
        this.queue = [];
        this.date = new Date();
        this.converting = false;
        this.eventSender = eventSender;
    }

    addToQueue(task: ConversionTask): void {
        this.queue.push(task);
        this.hash = md5(task.inputFile);
        this.outputFile = this.hash + ".mp4";
        this.eventSender.sendQueueEvent(this.hash, task);

        /* If the conversion is completed */
        if (!this.converting) {
            this.convertNext();
        }
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
            const inputDir = path.join(task.dir + "/tmp", task.inputFile);

            /* Generating the path to the folder with files after conversion */
            const outputDir = path.join(task.dir + "/converted", dateString);

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
                let fTime = Number(parse[1] + "." + parse[2]);
                return Math.round((fTime * 100) / time);
            };

            /* Converting function */
            ffmpeg(inputDir)
                .inputOption(["-vsync 0", "-hwaccel cuda", "-hwaccel_output_format cuda"])
                .toFormat("mp4")
                .videoCodec(task?.codec)
                .videoBitrate(task?.audioBitrate)

                /* Converting error */
                .on("error", async (err: Error) => {
                    console.log(`An error occurred: ${err.message}`);
                    await this.eventSender.sendErrorEvent(this.hash, err.message);
                    this.convertNext();
                })

                /* Start converting */
                .on("start", async () => {
                    console.log(`Conversion start: ${this.hash}`);
                    await this.eventSender.sendStartEvent(this.hash);
                    this.convertNext();
                })

                /* Converting progress percent */
                .on("progress", async (e, i) => {
                    console.log(`Conversion progress: ${this.hash}`);
                    /* Send progress of API backend panel */
                    await this.eventSender.sendProgressEvent(this.hash, {
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
                    await this.eventSender.sendCompleteEvent(this.hash, {
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

import { convQueueManager } from "./convQueueManager.mjs";
import { EventSender } from "./eventSender.js";

const eventSender = new EventSender("http://api.example.com");
const convManager = new convQueueManager(eventSender);

// convManager.addToQueue({
//   dir: './uploads',
//   inputFile: 'song.mp3',
//   codec: 'libmp3lame',
//   audioBitrate: 320
// });

convManager.addToQueue({
    dir: "./uploads",
    inputFile: "1.mp4",
    codec: "h264_nvenc",
    audioBitrate: 1000,
});

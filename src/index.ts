import { convQueueManager, ConversionTask, MediaConverterOptions } from "./convQueueManager.mjs";

export default class MediaConverter {
	
    converter: convQueueManager;

	constructor (options: MediaConverterOptions) {
		this.converter = new convQueueManager(options);
    }
	
	convert (options: ConversionTask) {
		
		if (!options.inputFile) {
			return false;
		}
		
		this.converter.addToQueue(options);
	}
	
	version () {
		return 'v1.0.0';
	}
}
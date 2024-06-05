import axios from 'axios';

export class EventSender {
  apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async sendQueueEvent(hash: string, task: any): Promise<void> {
    //await axios.post(`${this.apiUrl}/queue`, { hash, task });
  }

  async sendStartEvent(hash: string): Promise<void> {
    //await axios.post(`${this.apiUrl}/start`, hash);
  }

  async sendErrorEvent(hash: string, error: string): Promise<void> {
    //await axios.post(`${this.apiUrl}/error`, { hash, error });
  }

  async sendProgressEvent(hash: string, info: any): Promise<void> {
     //await axios.post(`${this.apiUrl}/progress`, { hash, info });
   }

  async sendCompleteEvent(hash: string, info: any): Promise<void> {
    //await axios.post(`${this.apiUrl}/complete`,  { hash, info });
  }

}
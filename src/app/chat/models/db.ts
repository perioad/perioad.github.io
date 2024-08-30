import { Message } from './chat';

export type HistoryRecord = {
  id: number;
  title: string;
  messages: Message[];
};

export interface Prompt {
  id?: number;
  title: string;
  content: string;
}

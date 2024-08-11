import { Message } from './chat';

export type HistoryRecord = {
  id: number;
  title: string;
  messages: Message[];
};

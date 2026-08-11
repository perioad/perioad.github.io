import { Message } from './chat';

export type HistoryRecord = {
  id: number;
  title: string;
  messages: Message[];
  // Absent on a chat that belongs to no project, which is most of them. The
  // chat points at the project rather than the project holding a list of chat
  // ids, so moving one is a single write and nothing can disagree about where
  // it lives.
  projectId?: number;
};

export interface Prompt {
  id?: number;
  title: string;
  content: string;
}

export interface Project {
  id?: number;
  title: string;
  instructions: string;
}

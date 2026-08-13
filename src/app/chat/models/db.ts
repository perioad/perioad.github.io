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
  // The model that last answered here, so reopening a conversation picks up on
  // the one it was held with. Absent on every chat saved before this was
  // recorded, which is why nothing may depend on it being there.
  model?: string;
  // Roughly what the next question will carry, counted by the api rather than
  // guessed here: what the last one carried, plus the words it answered with.
  // Absent until a reply has completed, so a chat that has never been answered
  // shows nothing rather than zero.
  usedTokens?: number;
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

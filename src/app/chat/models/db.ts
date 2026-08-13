import { Message } from './chat';

// What every stored record carries so that two copies of it, made on machines
// that have never met, can one day be reconciled.
export type SyncedRecord = {
  // A uuid rather than a counter. A counter names a record by how many came
  // before it, which two browsers always agree on and so always collide over.
  id: string;
  createdAt: number;
  // Bumped by every write, so that of two copies of a record the one written
  // later wins and nothing else has to be compared.
  updatedAt: number;
  // A removal is written down rather than carried out. A record that merely
  // vanished looks, to any copy of the data, like a record the copy still has
  // and this one is missing, and it would be helpfully sent back.
  deletedAt?: number;
};

export type HistoryRecord = SyncedRecord & {
  title: string;
  messages: Message[];
  // Absent on a chat that belongs to no project, which is most of them. The
  // chat points at the project rather than the project holding a list of chat
  // ids, so moving one is a single write and nothing can disagree about where
  // it lives.
  projectId?: string;
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

export type Prompt = SyncedRecord & {
  title: string;
  content: string;
};

export type Project = SyncedRecord & {
  title: string;
  instructions: string;
};

// What the settings form hands back: a project as the visitor described it,
// before the record around it exists.
export type ProjectDraft = {
  id?: string;
  title: string;
  instructions: string;
};

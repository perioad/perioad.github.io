export type Message = {
  content: string;
  role: 'assistant' | 'user';
  // Local only. A message carries its own pinned state instead of the chat
  // holding a list of ids, so there is nothing to keep in sync when the
  // conversation changes, and the pinned set is just a filter over the messages.
  isPinned?: boolean;
};

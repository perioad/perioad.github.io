export type Citation = {
  url: string;
  title: string;
  // Where the credited passage ends in `content`, which is where the marker for
  // it goes. The api counts characters of the reply itself, so an index only
  // means anything against the message it arrived with.
  endIndex: number;
};

export type Message = {
  content: string;
  role: 'assistant' | 'user';
  // Local only. A message carries its own pinned state instead of the chat
  // holding a list of ids, so there is nothing to keep in sync when the
  // conversation changes, and the pinned set is just a filter over the messages.
  isPinned?: boolean;
  // Absent unless the model searched the web while writing this reply. Kept
  // with the message so a conversation reopened tomorrow still shows where its
  // answers came from.
  citations?: Citation[];
};

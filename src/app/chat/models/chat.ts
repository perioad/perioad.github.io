export type Citation = {
  url: string;
  title: string;
  // Where the credited passage ends in `content`, which is where the marker for
  // it goes. The api counts characters of the reply itself, so an index only
  // means anything against the message it arrived with.
  endIndex: number;
};

export type Attachment = {
  name: string;
  mediaType: string;
  // Held as a data url rather than a blob url, which is a handle on something
  // in this page's memory and would be dead by the time the chat was reopened.
  // It is also what the api wants, so nothing has to be converted to send it.
  dataUrl: string;
};

export type Message = {
  content: string;
  role: 'assistant' | 'user';
  // What was sent along with the question. Only ever on a user's turn: the
  // model answers in words.
  attachments?: Attachment[];
  // Local only. A message carries its own pinned state instead of the chat
  // holding a list of ids, so there is nothing to keep in sync when the
  // conversation changes, and the pinned set is just a filter over the messages.
  isPinned?: boolean;
  // Absent unless the model searched the web while writing this reply. Kept
  // with the message so a conversation reopened tomorrow still shows where its
  // answers came from.
  citations?: Citation[];
};

import { HistoryRecord } from '../models/db';

// Not the stored record. That carries an IndexedDB key and a project id, and
// both are names for things in this browser that the file is leaving. What is
// left is the conversation itself: what was said, and where it came from.
function toDocument({ title, messages }: HistoryRecord) {
  return {
    title,
    exportedAt: new Date().toISOString(),
    messages: messages.map(({ role, content, citations }) => ({
      role,
      content,
      ...(citations?.length ? { citations } : {}),
    })),
  };
}

// Only the characters a filesystem reserves are taken out, rather than
// everything outside the latin alphabet: a title in another script is still the
// best name this file could have.
function toFileName(title: string) {
  const name = title
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    // A leading dot would hide the file on the way out.
    .replace(/^\.+/, '')
    .slice(0, 60)
    .replace(/-+$/, '');

  return `${name || 'chat'}.json`;
}

export function downloadChat(chat: HistoryRecord) {
  const blob = new Blob([JSON.stringify(toDocument(chat), null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = toFileName(chat.title);

  // In the document because Firefox ignores a click on an anchor that is not
  // in one.
  document.body.append(link);
  link.click();
  link.remove();

  // Not straight away. The browser reads the blob after the click returns, and
  // revoking the url out from under it saves an empty file.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

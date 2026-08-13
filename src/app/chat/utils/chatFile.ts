import { Message } from '../models/chat';
import { HistoryRecord, Project, Prompt, SyncedRecord } from '../models/db';

// Written into every full export so that the file can say what it is, rather
// than being recognised by guesswork over its shape.
const BACKUP_KIND = 'byok-backup';

// Not quite the stored record. The project id names a folder that a lone chat
// file is leaving behind, so it stays; the id and stamps go along, so a file
// finding its way back is recognised as the chat it came from rather than
// arriving as a stranger and settling in as a duplicate.
function toChatDocument({
  id,
  title,
  createdAt,
  updatedAt,
  messages,
  model,
  usedTokens,
}: HistoryRecord) {
  return {
    id,
    title,
    createdAt,
    updatedAt,
    ...(model ? { model } : {}),
    ...(usedTokens ? { usedTokens } : {}),
    messages: messages.map(({ role, content, citations, attachments }) => ({
      role,
      content,
      ...(citations?.length ? { citations } : {}),
      ...(attachments?.length ? { attachments } : {}),
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

function downloadFile(fileName: string, contents: unknown) {
  const blob = new Blob([JSON.stringify(contents, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;

  // In the document because Firefox ignores a click on an anchor that is not
  // in one.
  document.body.append(link);
  link.click();
  link.remove();

  // Not straight away. The browser reads the blob after the click returns, and
  // revoking the url out from under it saves an empty file.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadChat(chat: HistoryRecord) {
  downloadFile(toFileName(chat.title), {
    ...toChatDocument(chat),
    exportedAt: new Date().toISOString(),
  });
}

// The whole database in one file: every chat, prompt and project that is not
// deleted, with their ids and stamps, so importing it elsewhere is a merge
// with what lives there rather than a second copy of everything.
export function downloadBackup(
  chats: HistoryRecord[],
  prompts: Prompt[],
  projects: Project[],
) {
  const exportedAt = new Date().toISOString();

  downloadFile(`everything-${exportedAt.slice(0, 10)}.json`, {
    kind: BACKUP_KIND,
    exportedAt,
    chats: chats.map((chat) => ({
      ...toChatDocument(chat),
      // Unlike a lone chat file, this one carries the projects too, so the
      // reference still points at something on arrival.
      ...(chat.projectId ? { projectId: chat.projectId } : {}),
    })),
    prompts: prompts.map(({ id, title, content, createdAt, updatedAt }) => ({
      id,
      title,
      content,
      createdAt,
      updatedAt,
    })),
    projects: projects.map(
      ({ id, title, instructions, createdAt, updatedAt }) => ({
        id,
        title,
        instructions,
        createdAt,
        updatedAt,
      }),
    ),
  });
}

// Anything can be dropped into a file picker, including a chat exported by
// something else entirely, so nothing read here is taken on trust. Only the
// fields this app wrote are looked for, and a turn missing either of them is
// dropped rather than allowed to become a message with no words or no speaker.
function toMessage(value: unknown): Message | null {
  if (typeof value !== 'object' || value === null) return null;

  const { role, content, citations, attachments } = value as Record<
    string,
    unknown
  >;

  if (role !== 'user' && role !== 'assistant') return null;
  if (typeof content !== 'string') return null;

  return {
    role,
    content,
    ...(Array.isArray(citations) ? { citations } : {}),
    ...(Array.isArray(attachments) ? { attachments } : {}),
  };
}

// Files from before records were stamped have no id or timestamps, so a record
// missing them is given fresh ones rather than turned away. A fresh id means
// such a file imports as a new record every time, which is exactly what those
// old files always did.
function toStamps(value: Record<string, unknown>): SyncedRecord {
  return {
    id: typeof value.id === 'string' ? value.id : crypto.randomUUID(),
    createdAt:
      typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
    updatedAt:
      typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
  };
}

function toChat(value: unknown): HistoryRecord | null {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;

  if (!Array.isArray(record.messages)) return null;

  const messages = record.messages
    .map(toMessage)
    .filter((message) => message !== null);

  if (!messages.length) return null;

  return {
    ...toStamps(record),
    title:
      typeof record.title === 'string' && record.title.trim()
        ? record.title
        : 'Imported chat',
    messages,
    ...(typeof record.projectId === 'string'
      ? { projectId: record.projectId }
      : {}),
    ...(typeof record.model === 'string' ? { model: record.model } : {}),
    ...(typeof record.usedTokens === 'number'
      ? { usedTokens: record.usedTokens }
      : {}),
  };
}

function toPrompt(value: unknown): Prompt | null {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;

  if (typeof record.title !== 'string' || typeof record.content !== 'string') {
    return null;
  }

  return { ...toStamps(record), title: record.title, content: record.content };
}

function toProject(value: unknown): Project | null {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;

  if (
    typeof record.title !== 'string' ||
    typeof record.instructions !== 'string'
  ) {
    return null;
  }

  return {
    ...toStamps(record),
    title: record.title,
    instructions: record.instructions,
  };
}

function toRecords<T>(value: unknown, parse: (item: unknown) => T | null): T[] {
  return Array.isArray(value)
    ? value.map(parse).filter((record) => record !== null)
    : [];
}

export type Upload =
  | { kind: 'chat'; chat: HistoryRecord }
  | {
      kind: 'backup';
      chats: HistoryRecord[];
      prompts: Prompt[];
      projects: Project[];
    };

// One reader for both things a visitor might hand back: a single exported
// chat, or an export of everything. Told apart by shape rather than only by
// the kind field, so a file whose messages are right there is not refused
// over a missing label.
export function parseUpload(text: string): Upload {
  const document: unknown = JSON.parse(text);

  if (typeof document !== 'object' || document === null) {
    throw new Error('not a chat or a backup');
  }

  const parsed = document as Record<string, unknown>;

  if (Array.isArray(parsed.messages)) {
    const chat = toChat(parsed);

    if (!chat) throw new Error('not a chat');

    return { kind: 'chat', chat };
  }

  if (
    parsed.kind === BACKUP_KIND ||
    [parsed.chats, parsed.prompts, parsed.projects].some(Array.isArray)
  ) {
    return {
      kind: 'backup',
      chats: toRecords(parsed.chats, toChat),
      prompts: toRecords(parsed.prompts, toPrompt),
      projects: toRecords(parsed.projects, toProject),
    };
  }

  throw new Error('not a chat or a backup');
}

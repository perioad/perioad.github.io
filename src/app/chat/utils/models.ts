import { Model, ResponsesModel } from 'openai/resources/index.mjs';

// The one generation this app offers. Everything before it took a different
// subset of the reasoning levels, a different context window and a different
// set of modalities, all of which had to be guessed from the id because the
// models endpoint reports no capabilities. Holding to a single generation is
// what lets that guesswork go: these all read images, all search the web, and
// all take the same six levels of thinking.
//
// The cost is that this needs editing when the next generation lands. That is
// deliberate, and `offeredModels` below makes it a stale list rather than a
// broken app.
const CURRENT_GENERATION = 'gpt-5.6-';

// The generation is wider than the models that answer questions in a chat: a
// coding agent, a cybersecurity model, and the audio and image lines all carry
// the same prefix and none of them belong in this list.
const SPECIALISED = [
  'codex',
  'cyber',
  'computer-use',
  'deep-research',
  'audio',
  'realtime',
  'transcribe',
  'tts',
  'image',
];

// A dated snapshot is the same model as the alias it was cut from and is
// listed beside it, so offering both is offering one thing twice.
const DATED_SNAPSHOT = /-\d{4}-\d{2}-\d{2}$/;

// The cheapest of the three, which is the right default for a chat where most
// questions are not hard ones. The other two are a dropdown away for the ones
// that are.
export const DEFAULT_MODEL: ResponsesModel = 'gpt-5.6-luna';

// Naming a chat asks less again, and never enough to be worth more.
export const TITLE_MODEL: ResponsesModel = 'gpt-5.6-luna';

export function isCurrentGeneration(id: string): boolean {
  return id.startsWith(CURRENT_GENERATION);
}

// Shared by all three of the current generation, which is the whole point of
// offering only one: there is no table to keep, and nothing to be wrong about.
const CURRENT_CONTEXT_WINDOW = 1_050_000;

// For a model pinned into the list from an older save, or reached through the
// fallback. The smallest window any recent model has, so an unrecognised one
// is read as fuller than it is rather than emptier.
const UNKNOWN_CONTEXT_WINDOW = 128_000;

// What a chat is measured against, which is deliberately not what it is capped
// at. A million tokens is so far off that a gauge reading against it would sit
// empty forever and say nothing; this is the point where a conversation has
// grown long enough to be worth starting again, and is the more useful thing
// to be told. Nothing enforces it.
const COMFORTABLE_BUDGET = 300_000;

function contextWindowFor(model: string): number {
  return isCurrentGeneration(model)
    ? CURRENT_CONTEXT_WINDOW
    : UNKNOWN_CONTEXT_WINDOW;
}

export function contextBudgetFor(model: string): number {
  // A model whose window is smaller than the budget is measured against the
  // window, because there the ring filling up is a real wall and not advice.
  return Math.min(COMFORTABLE_BUDGET, contextWindowFor(model));
}

function isOffered(id: string): boolean {
  if (!isCurrentGeneration(id)) return false;
  if (DATED_SNAPSHOT.test(id)) return false;
  // A pro model can spend minutes on a question, which wants background mode
  // rather than a stream held open.
  if (id.endsWith('-pro')) return false;

  return !SPECIALISED.some((name) => id.includes(name));
}

// Only consulted when the current generation is nowhere to be found, so this
// list is the safety net rather than the rule it used to be.
const NOT_A_CHAT_MODEL = [
  'audio',
  'realtime',
  'transcribe',
  'tts',
  'whisper',
  'image',
  'dall-e',
  'sora',
  'embedding',
  'moderation',
  'babbage',
  'davinci',
  'instruct',
  'codex',
  'computer-use',
  'deep-research',
  'search-preview',
];

function couldAnswerAChat(id: string): boolean {
  if (NOT_A_CHAT_MODEL.some((pattern) => id.includes(pattern))) return false;

  return !id.endsWith('-pro');
}

// Newest first, because that is the order the list is read in and there is no
// other ranking the api gives us.
export function offeredModels(models: Model[]): ResponsesModel[] {
  const newestFirst = [...models]
    .sort((a, b) => b.created - a.created)
    .map(({ id }) => id);

  const current = newestFirst.filter(isOffered);

  // A key with no sight of the current generation, or a generation that has
  // been retired since this was last edited, would otherwise leave an empty
  // select and no way to ask anything at all.
  return current.length > 0 ? current : newestFirst.filter(couldAnswerAChat);
}

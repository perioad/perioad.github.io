import type { ResponseFunctionWebSearch } from 'openai/resources/responses/responses.mjs';
import { Citation } from '../models/chat';

// Inferred from the id, because the models endpoint reports no capabilities.
// Handing the tool to a model that never had it is a 400 rather than a reply
// without search, and the picker still offers the families that predate it.
export function supportsWebSearch(model: string): boolean {
  // o1 was shipped before the hosted tools existed. o3 and o4 have them.
  if (/^o\d/.test(model)) return /^o[34]/.test(model);

  // gpt-4o and gpt-4.1 upwards. Plain `gpt-4`, `gpt-4-turbo` and the 3.5 line
  // are what this leaves behind.
  return /^gpt-4o|^gpt-4\.1|^gpt-([5-9]|\d\d)/.test(model);
}

// A tool handed over without guidance gets reached for constantly. Reasoning
// models run their searches inside the chain of thought, so a question they
// could answer outright still earns a confirming lookup, and each one is a cent
// and a wait. ChatGPT is selective because its own prompt says when to search,
// not because a model left to itself decides well. `max_tool_calls` is the
// other lever and the worse one: it cuts a model off mid-question rather than
// heading off the searches it never needed, and the developers who tried it
// report the answers suffer for it.
export const SEARCH_GUIDANCE = `You can search the web. Every search costs the user money and time, so treat it as something to reach for rather than a reflex.

Search when the answer turns on something you cannot know or cannot be current on: news and recent events, prices, versions and releases, schedules, results, live status, anything the user asks you to look up, and any URL they give you.

Do not search for settled knowledge, explanations, definitions, how-to advice, opinions, writing, maths or code. Do not search to confirm something you already know, and never run a search with an empty or vague query.

When you can answer well without searching, answer.`;

export type Source = {
  url: string;
  title: string;
};

function isLinkable(url: string): boolean {
  try {
    const { protocol } = new URL(url);

    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Ordered by first mention and holding each page once, so a page credited three
// times is one line in the list and carries the same number every time it is
// marked in the text.
export function collectSources(citations: Citation[]): Source[] {
  const sources: Source[] = [];

  for (const { url, title } of citations) {
    if (!isLinkable(url)) continue;

    if (sources.some((source) => source.url === url)) continue;

    sources.push({ url, title: title || hostOf(url) });
  }

  return sources;
}

const ATTRIBUTE_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ATTRIBUTE_ESCAPES[character]);
}

// The markers are html spliced into the markdown the model wrote, which is
// parsed and then set as html. A title is a page's own words and a url is a
// string the tool picked, so neither can be left to stay inside the attribute
// it is written into. `isLinkable` covers the other half of that: an anchor
// will happily run `javascript:` when it is clicked.
export function withCitationMarkers(
  content: string,
  citations: Citation[],
): string {
  if (citations.length === 0) return content;

  const sources = collectSources(citations);

  // Spliced back to front, so an earlier marker cannot shift the index a later
  // one was measured against.
  const backToFront = [...citations].sort((a, b) => b.endIndex - a.endIndex);

  return backToFront.reduce((text, { url, title, endIndex }) => {
    const number = sources.findIndex((source) => source.url === url) + 1;

    if (number === 0) return text;

    const at = Math.min(Math.max(endIndex, 0), text.length);
    const label = escapeAttribute(`${title || hostOf(url)} — ${hostOf(url)}`);
    const marker = `<a class="citation" href="${escapeAttribute(url)}" target="_blank" rel="noreferrer" title="${label}">${number}</a>`;

    return text.slice(0, at) + marker + text.slice(at);
  }, content);
}

// The event that carries an annotation while the reply streams types it as
// `unknown`, and url citations arrive among file and container ones, so the
// shape is checked here rather than asserted.
export function toCitation(annotation: unknown): Citation | null {
  if (typeof annotation !== 'object' || annotation === null) return null;

  const {
    type,
    url,
    title,
    end_index: endIndex,
  } = annotation as Record<string, unknown>;

  if (type !== 'url_citation') return null;

  if (typeof url !== 'string' || typeof endIndex !== 'number') return null;

  return { url, title: typeof title === 'string' ? title : '', endIndex };
}

// The api types the action as always there, and a call announced as it opens
// arrives without one, so every field it should hold is treated as missing
// until it turns up. A search nobody can describe yet is still a search worth
// saying out loud.
export function describeSearchAction(
  action: ResponseFunctionWebSearch['action'] | undefined,
): string {
  if (action?.type === 'open_page' || action?.type === 'find_in_page') {
    return action.url ? `reading ${hostOf(action.url)}` : 'reading a page';
  }

  // `queries` is optional even on a search, and the model often runs several at
  // once. The first is the one worth the width the header has.
  const [query] = action?.queries ?? [];

  return query ? `searching the web for ${query}` : 'searching the web';
}

import { isCurrentGeneration } from './models';

export type ThinkingLevel =
  | 'none'
  | 'low'
  | 'medium'
  | 'high'
  | 'xhigh'
  | 'max';

// Every level the current generation takes, from reasoning switched off
// outright to as much of it as the model will do.
export const THINKING_LEVELS: ThinkingLevel[] = [
  'none',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
];

// What an older model is offered instead. Which levels a given family accepts
// varies by generation and an unsupported one is a 400 rather than a
// downgrade, so anything outside the current generation gets the three that
// every reasoning model has taken since the o-series introduced the parameter.
const ESTABLISHED_LEVELS: ThinkingLevel[] = ['low', 'medium', 'high'];

// The api's own default, and the level to fall back to when a model cannot
// take the one that was chosen.
export const DEFAULT_THINKING_LEVEL: ThinkingLevel = 'medium';

// Inferred from the id, because the models endpoint reports no capabilities.
export function supportsThinking(model: string): boolean {
  if (isCurrentGeneration(model)) return true;

  // The non-reasoning sibling of the gpt-5 line.
  if (model.includes('chat-latest')) return false;

  // Both shipped before the parameter existed.
  if (/^o1-(mini|preview)/.test(model)) return false;

  if (/^o\d/.test(model)) return true;

  // gpt-5 and anything numbered above it. `gpt-4o` is not matched, and neither
  // is a hypothetical `gpt-4.5`.
  return /^gpt-([5-9]|\d\d)/.test(model);
}

export function thinkingLevelsFor(model: string): ThinkingLevel[] {
  return isCurrentGeneration(model) ? THINKING_LEVELS : ESTABLISHED_LEVELS;
}

// A level chosen for one model and still selected under another that cannot
// take it. Reached through the model pinned into the list when a saved choice
// is no longer offered, and through the fallback list behind it.
export function thinkingLevelFor(
  model: string,
  level: ThinkingLevel,
): ThinkingLevel {
  return thinkingLevelsFor(model).includes(level)
    ? level
    : DEFAULT_THINKING_LEVEL;
}

export function parseThinkingLevel(value: string | null): ThinkingLevel | null {
  return THINKING_LEVELS.includes(value as ThinkingLevel)
    ? (value as ThinkingLevel)
    : null;
}

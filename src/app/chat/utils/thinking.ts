export type ThinkingLevel = 'low' | 'medium' | 'high';

// The api also takes `none`, `minimal`, `xhigh` and `max`, but which of those a
// given model accepts varies by family and generation, and an unsupported one
// is a 400 rather than a downgrade. These three are the levels every reasoning
// model has taken since the o-series introduced the parameter.
export const THINKING_LEVELS: ThinkingLevel[] = ['low', 'medium', 'high'];

export const DEFAULT_THINKING_LEVEL: ThinkingLevel = 'medium';

// Inferred from the id, because the models endpoint reports no capabilities.
export function supportsThinking(model: string): boolean {
  // The non-reasoning sibling of the gpt-5 line.
  if (model.includes('chat-latest')) return false;

  // Both shipped before the parameter existed.
  if (/^o1-(mini|preview)/.test(model)) return false;

  if (/^o\d/.test(model)) return true;

  // gpt-5 and anything numbered above it. `gpt-4o` is not matched, and neither
  // is a hypothetical `gpt-4.5`.
  return /^gpt-([5-9]|\d\d)/.test(model);
}

export function parseThinkingLevel(value: string | null): ThinkingLevel | null {
  return THINKING_LEVELS.includes(value as ThinkingLevel)
    ? (value as ThinkingLevel)
    : null;
}

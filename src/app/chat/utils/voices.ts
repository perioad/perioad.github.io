// Only the voices gpt-4o-mini-tts accepts. Marin and cedar exist solely on
// this model and are tuned for conversational delivery, which is why marin is
// the default over the older alloy.
export const VOICES = [
  'marin',
  'cedar',
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'nova',
  'onyx',
  'sage',
  'shimmer',
  'verse',
] as const;

export const DEFAULT_VOICE = 'marin';

export const VOICE_STORAGE_KEY = 'voice';

// Left unsteered, gpt-4o-mini-tts reads slightly flat and robotic; the
// instructions are the model's one lever the older tts models lack, and they
// cost a few input tokens.
export const DEFAULT_VOICE_PROMPT =
  'Speak in a warm, natural, conversational tone, as if explaining to a friend.';

export const VOICE_PROMPT_STORAGE_KEY = 'voicePrompt';

export function getSavedVoice(): string {
  if (typeof window === 'undefined') return DEFAULT_VOICE;

  return localStorage.getItem(VOICE_STORAGE_KEY) ?? DEFAULT_VOICE;
}

export function getSavedVoicePrompt(): string {
  if (typeof window === 'undefined') return DEFAULT_VOICE_PROMPT;

  return localStorage.getItem(VOICE_PROMPT_STORAGE_KEY) ?? DEFAULT_VOICE_PROMPT;
}

export type AudioSlot = { current: HTMLAudioElement | null };

// One element per source, shared by everything that plays it: the same click is
// used all over the page, and a copy per component would be a download per
// component and another thing to keep in step with the mute setting.
const registry = new Map<string, AudioSlot>();

// A slot rather than the element, because the element is only built once the
// browser is allowed to make sound, and the callers hold on to the slot from
// their first render.
export function getAudioSlot(src: string): AudioSlot {
  let slot = registry.get(src);

  if (!slot) {
    slot = { current: null };
    registry.set(src, slot);
  }

  return slot;
}

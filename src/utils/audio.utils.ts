// `play()` rejects when playback never starts. Two of those rejections are
// routine here and carry nothing to act on: muting pauses the effect sounds in
// the same commit that plays them (`AbortError`), and iOS refuses playback that
// no gesture asked for (`NotAllowedError`). Anything else is unexpected and is
// rethrown so it still surfaces.
const EXPECTED_PLAY_FAILURES = ['AbortError', 'NotAllowedError'];

export function playAudio(audioElement: HTMLAudioElement | null | undefined) {
  audioElement?.play().catch((error: unknown) => {
    const name = error instanceof DOMException ? error.name : '';

    if (!EXPECTED_PLAY_FAILURES.includes(name)) {
      throw error;
    }
  });
}

import { useState } from 'react';
import Modal, { modalField } from '../../components/Modal';
import {
  DEFAULT_VOICE_PROMPT,
  getSavedVoice,
  getSavedVoicePrompt,
  VOICE_PROMPT_STORAGE_KEY,
  VOICE_STORAGE_KEY,
  VOICES,
} from '../utils/voices';

export default function VoiceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [voice, setVoice] = useState(getSavedVoice);
  const [prompt, setPrompt] = useState(getSavedVoicePrompt);

  function save() {
    const trimmed = prompt.trim();

    localStorage.setItem(VOICE_STORAGE_KEY, voice);

    // Cleared means the default, not silence-about-tone: a prompt is the one
    // thing keeping this model from reading flat.
    if (trimmed) {
      localStorage.setItem(VOICE_PROMPT_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(VOICE_PROMPT_STORAGE_KEY);
      setPrompt(DEFAULT_VOICE_PROMPT);
    }

    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="read aloud voice">
      <p className="mb-3 text-slate-500 dark:text-slate-400">
        how replies sound when read out. the prompt steers tone and pacing;
        clear it to get the default back.
      </p>

      <label className="mb-1 block" htmlFor="voice">
        voice:
      </label>

      <select
        id="voice"
        className={`${modalField} mb-3 cursor-pointer`}
        value={voice}
        onChange={(event) => setVoice(event.target.value)}
      >
        {VOICES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <label className="mb-1 block" htmlFor="voice-prompt">
        prompt:
      </label>

      <textarea
        id="voice-prompt"
        className={`${modalField} h-32 resize-none`}
        placeholder={DEFAULT_VOICE_PROMPT}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />

      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 cursor-pointer rounded-md bg-slate-100 p-2 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          onClick={onClose}
        >
          cancel
        </button>

        <button
          className="flex-1 cursor-pointer rounded-md bg-green-600 p-2 transition-all hover:bg-green-700"
          onClick={save}
        >
          save
        </button>
      </div>
    </Modal>
  );
}

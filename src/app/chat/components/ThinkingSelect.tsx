import { ChangeEvent } from 'react';
import {
  ThinkingLevel,
  thinkingLevelFor,
  thinkingLevelsFor,
} from '../utils/thinking';

interface ThinkingSelectProps {
  model: string;
  level: ThinkingLevel;
  setLevel: (level: ThinkingLevel) => void;
}

export default function ThinkingSelect({
  model,
  level,
  setLevel,
}: ThinkingSelectProps) {
  // Not every model takes every level, and offering one that a model refuses
  // turns the next question into a 400.
  const levels = thinkingLevelsFor(model);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLevel(event.target.value as ThinkingLevel);
  }

  return (
    <select
      // Holds its width while the model beside it takes and gives back the
      // room, since it is the one with a name long enough to need it. Shrinks
      // only once that one has nothing left to give.
      className="w-24 min-w-0 shrink cursor-pointer rounded-md bg-slate-700 px-2 py-1 text-center text-ellipsis transition-all hover:bg-slate-800"
      // Shown as it will be sent. A level saved under one model and not taken
      // by another would otherwise leave the select matching no option, and a
      // select with no matching option renders empty.
      value={thinkingLevelFor(model, level)}
      title="Thinking level"
      aria-label="Thinking level"
      onChange={handleChange}
    >
      {levels.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

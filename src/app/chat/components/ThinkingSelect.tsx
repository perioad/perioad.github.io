import { ChangeEvent } from 'react';
import { THINKING_LEVELS, ThinkingLevel } from '../utils/thinking';

interface ThinkingSelectProps {
  level: ThinkingLevel;
  setLevel: (level: ThinkingLevel) => void;
}

export default function ThinkingSelect({
  level,
  setLevel,
}: ThinkingSelectProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLevel(event.target.value as ThinkingLevel);
  }

  return (
    <select
      // Holds its width while the model beside it takes and gives back the
      // room, since it is the one with a name long enough to need it. Shrinks
      // only once that one has nothing left to give.
      className="w-24 min-w-0 shrink cursor-pointer rounded-md bg-slate-700 px-2 py-1 text-center text-ellipsis transition-all hover:bg-slate-800"
      value={level}
      title="Thinking level"
      aria-label="Thinking level"
      onChange={handleChange}
    >
      {THINKING_LEVELS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

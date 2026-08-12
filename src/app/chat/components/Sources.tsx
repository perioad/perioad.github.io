import { Citation } from '../models/chat';
import { collectSources, hostOf } from '../utils/webSearch';

// Folded away by default, the way the numbers in the reply are enough for a
// reader who is not checking the work. Open it and every page stands on its own
// line, numbered to match the marker that sent you here.
export default function Sources({ citations }: { citations: Citation[] }) {
  const sources = collectSources(citations);

  if (sources.length === 0) return null;

  return (
    <details className="mt-1">
      <summary className="inline-flex h-9 cursor-pointer items-center rounded-md px-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-inherit dark:text-slate-400 dark:hover:bg-slate-800">
        sources ({sources.length})
      </summary>

      <ol className="mb-1 flex flex-col gap-1 px-2">
        {sources.map(({ url, title }, index) => (
          <li key={url} className="flex gap-2">
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {index + 1}
            </span>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 hover:underline"
            >
              {title}{' '}
              <span className="text-slate-500 dark:text-slate-400">
                {hostOf(url)}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

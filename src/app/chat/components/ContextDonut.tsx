// Drawn as a ring rather than written as a number, because the number is
// meaningless without the one beside it and both together are too much to read
// at a glance. How much of the ring has come round says it in one look, and the
// figures are there on hover for when the answer matters.
const SIZE = 20;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Advice rather than alarm: the budget is not a wall, so amber reads as a chat
// getting long and red as one worth starting again. A full ring is the most
// either can say, since nothing here stops a conversation.
function fillColour(fraction: number): string {
  if (fraction >= 0.9) return 'stroke-red-500';
  if (fraction >= 0.7) return 'stroke-amber-500';

  return 'stroke-sky-500';
}

export default function ContextDonut({
  used,
  budget,
}: {
  used: number;
  budget: number;
}) {
  // Nothing has been asked yet, so there is nothing to report and a ring
  // sitting empty in the header would only be furniture.
  if (used <= 0 || budget <= 0) return null;

  // Held at a full ring once the budget is passed, which keeps happening: it is
  // a mark to notice, not a limit to be stopped by.
  const fraction = Math.min(1, used / budget);
  const label = `${used.toLocaleString()} of ${budget.toLocaleString()} tokens in this chat`;

  return (
    <svg
      // Turned so the ring fills from the top, which is where a dial is read
      // from, rather than from three o'clock where an arc starts.
      className="h-5 w-5 shrink-0 -rotate-90"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>

      <circle
        className="stroke-slate-300 dark:stroke-slate-700"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
      />

      <circle
        className={`${fillColour(fraction)} transition-all`}
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        // The drawn part of a dashed outline, with a gap long enough that the
        // rest of the ring never comes back round.
        strokeDasharray={`${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
      />
    </svg>
  );
}

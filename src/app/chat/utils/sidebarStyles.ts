// The two rails are the same furniture on either side of the conversation, and
// keeping their classes apart is what let them drift: chats and prompts had
// arrived at different fills, different hovers, and a row action written out
// twice by hand.

const row =
  'group relative flex rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800';

// The row is the target, so all of it answers the pointer rather than only the
// label inside it. It stacks in the drawer, where the actions are full size
// because there is no hover to reveal them and three of them leave a title
// almost nothing to sit in.
export const sidebarRow = `${row} flex-col items-stretch sm:flex-row sm:items-center`;

// Two actions still leave a title room to sit in at full size, so a row with
// only that many keeps them beside the name at every width. Stacking them under
// a project pushed its chats a touch target away from the folder they are
// filed under.
export const sidebarRowInline = `${row} flex-row items-center`;

// Pulled up into the padding the two touch targets stack back to back, which
// is otherwise wide enough to read as a break between the title and the
// buttons that belong to it. `contents` dissolves the wrapper on a wide screen,
// where the buttons go back to being children of the row itself and keep the
// widths they collapse to until it is hovered.
export const sidebarRowActions = '-mt-2 flex sm:contents justify-around';

// Drawn as a pseudo element rather than a border, which would move the label
// two pixels the moment a chat was opened.
const track =
  'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full';

// Every chat carries the bar, so the list has an edge to read down and the one
// being read is a change of colour rather than something that appears.
export const sidebarRowTrack = `${track} before:bg-slate-200 dark:before:bg-slate-700`;

// The two are exclusive: a row takes one or the other, so nothing is left to
// the order Tailwind happens to emit two background colours in.
export const sidebarRowSelected = `${track} bg-slate-100 before:bg-sky-500 dark:bg-slate-800`;

export const sidebarRowLabel =
  'min-h-11 grow overflow-hidden px-3 text-left text-ellipsis whitespace-nowrap sm:min-h-9';

// No width until the row is hovered, so a rail this narrow spends what it has
// on the title until there is a reason not to. Full size on a touch screen,
// which has no hover to spend it on.
export const sidebarRowAction =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-200 sm:h-9 sm:w-0 sm:opacity-0 sm:group-hover:w-9 sm:group-hover:opacity-100 sm:focus-visible:w-9 sm:focus-visible:opacity-100 dark:hover:bg-slate-700';

export const sidebarHeadingRow = 'flex items-center justify-between pr-1';

export const sidebarHeading = 'px-3 text-xs text-slate-500 dark:text-slate-400';

// Always shown, unlike a row's actions, because it is the only way to start a
// project or a prompt and there is no row to hover when there are none yet.
export const sidebarHeadingAction =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-inherit sm:h-9 sm:w-9 dark:text-slate-400 dark:hover:bg-slate-800';

export const sidebarEmptyNote = 'px-3 py-2 text-slate-500 dark:text-slate-400';

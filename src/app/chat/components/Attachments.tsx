import { FileText, X } from 'lucide-react';
import { Attachment } from '../models/chat';
import { isImage, openAttachment } from '../utils/attachments';

const box =
  'relative flex h-16 items-center overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800';

// Small enough to sit in a row above the words without taking the turn over,
// and big enough to tell one screenshot from another.
export function AttachmentTile({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`${box} ${isImage(attachment) ? 'w-16' : 'max-w-48 gap-2 px-2'}`}
    >
      <button
        className="flex h-full min-w-0 items-center gap-2"
        onClick={() => openAttachment(attachment)}
        title={`Open ${attachment.name}`}
      >
        {isImage(attachment) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-16 w-16 object-cover"
            src={attachment.dataUrl}
            alt={attachment.name}
          />
        ) : (
          <>
            <FileText className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate text-left">{attachment.name}</span>
          </>
        )}
      </button>

      {onRemove && (
        <button
          className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          onClick={onRemove}
          title={`Remove ${attachment.name}`}
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function AttachmentList({
  attachments,
  align = 'start',
  onRemove,
}: {
  attachments: Attachment[];
  align?: 'start' | 'end';
  onRemove?: (index: number) => void;
}) {
  if (!attachments.length) return null;

  return (
    <div
      className={`flex flex-wrap gap-2 ${align === 'end' ? 'justify-end' : ''}`}
    >
      {attachments.map((attachment, index) => (
        <AttachmentTile
          key={`${attachment.name}-${index}`}
          attachment={attachment}
          onRemove={onRemove && (() => onRemove(index))}
        />
      ))}
    </div>
  );
}

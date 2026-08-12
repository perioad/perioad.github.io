import { ResponseInputItem } from 'openai/resources/responses/responses.mjs';
import { Attachment, Message } from '../models/chat';

// Everything is held as a data url in IndexedDB and sent as one, which costs a
// third again in base64 on both counts. Past this the browser starts to feel
// it, and so does the bill for a request carrying it.
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

// What the api will look at. Anything else would be sent as a file and read as
// bytes, which for a spreadsheet or a zip means an apology rather than an
// answer, so it is refused here where the reason can be given.
export const ACCEPTED_ATTACHMENTS = 'image/*,application/pdf,text/*';

export function isImage({ mediaType }: Attachment) {
  return mediaType.startsWith('image/');
}

export function readAsAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);
    reader.onload = () =>
      resolve({
        name: file.name,
        // Not every file has one, and the api reads the type off the url
        // rather than the name.
        mediaType: file.type || 'application/octet-stream',
        dataUrl: String(reader.result),
      });

    reader.readAsDataURL(file);
  });
}

// Browsers refuse to navigate to a data url, which is what an attachment is
// held as, so opening one means handing over something that is only a handle
// on it. Left unrevoked: the tab that was opened is still reading it, and this
// one is not the last word on when it has finished.
export async function openAttachment({ dataUrl }: Attachment) {
  const blob = await (await fetch(dataUrl)).blob();

  window.open(URL.createObjectURL(blob), '_blank', 'noreferrer');
}

function toContentPart(attachment: Attachment) {
  return isImage(attachment)
    ? ({
        type: 'input_image',
        image_url: attachment.dataUrl,
        detail: 'auto',
      } as const)
    : ({
        type: 'input_file',
        filename: attachment.name,
        file_data: attachment.dataUrl,
      } as const);
}

// A plain string while a turn is only words, which is all of them until
// something is attached, and a list of parts once it is not. The attachments
// lead, because the question is usually about them.
export function toInput({
  role,
  content,
  attachments,
}: Message): ResponseInputItem {
  if (!attachments?.length) {
    return { role, content };
  }

  return {
    role,
    content: [
      ...attachments.map(toContentPart),
      // A picture can be the whole question. An empty part alongside it is not
      // a question at all, and some models refuse one.
      ...(content ? [{ type: 'input_text' as const, text: content }] : []),
    ],
  };
}

import { Source_Code_Pro } from 'next/font/google';

// A class rather than something inherited, because the drawers and dialogs are
// portalled to the body and so land outside the element the chat sets its face
// on. Loaded once here so they all ask for the same file.
export const monospace = Source_Code_Pro({ weight: '400', subsets: ['latin'] });

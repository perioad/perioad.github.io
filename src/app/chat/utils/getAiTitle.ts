import OpenAI from 'openai';

// The cheapest model on offer, and naming a chat asks very little of it.
// `minimal` is as far down as this generation goes: `none`, which switches
// reasoning off outright, arrived with gpt-5.1. Worth setting either way, since
// the default is `medium` and the model would otherwise think at length before
// answering with five words.
const TITLE_MODEL = 'gpt-5-nano';

// The word limit below is a request rather than a rule, and titles come back
// wrapped in quotes often enough to be worth undoing.
function tidyTitle(raw: string | null): string | null {
  const title = raw
    ?.replace(/\s+/g, ' ')
    .replace(/^["'`]+|["'`.]+$/g, '')
    .trim();

  if (!title) return null;

  return title.split(' ').slice(0, 6).join(' ');
}

export async function getAiTitle(content: string) {
  const apiKey = localStorage.getItem('key');

  // Silent where the other callers alert. This runs behind the conversation,
  // and the reply the user is waiting for already reports the missing key.
  if (!apiKey) return null;

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const response = await openai.chat.completions.create({
    model: TITLE_MODEL,
    reasoning_effort: 'minimal',
    messages: [
      {
        role: 'user',
        content: `Create a chat title in maximum 5 words based on this text without any symbols and without articles: ${content}`,
      },
    ],
  });

  return tidyTitle(response.choices[0].message.content);
}

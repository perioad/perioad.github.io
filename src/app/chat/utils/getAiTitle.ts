import OpenAI from 'openai';

export async function getAiTitle(content: string) {
  const apiKey = localStorage.getItem('key');

  if (!apiKey) {
    alert(
      'There is no openai api key. Add it by pressing the key button in the header',
    );

    return null;
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Create a chat title in maximum 3 words based on this text without any symbols and without articles: ${content}`,
      },
    ],
  });

  return response.choices[0].message.content;
}

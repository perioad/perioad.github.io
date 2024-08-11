import OpenAI from 'openai';
import { useEffect } from 'react';
import { Message } from '../models/chat';
import { ChatModel } from 'openai/resources/index.mjs';

const useAiStream = (
  shouldRequest: boolean,
  messages: Message[],
  onNewChunk: (content: string) => Promise<void>,
  model: ChatModel,
) => {
  useEffect(() => {
    if (!shouldRequest) return;

    const fetchApiKey = () => {
      const apiKey = localStorage.getItem('key');
      if (!apiKey) {
        alert(
          'There is no OpenAI API key. Add it by pressing the key button in the header.',
        );
        throw new Error('API key missing');
      }
      return apiKey;
    };

    const apiKey = fetchApiKey();

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const ask = async () => {
      try {
        const stream = await openai.chat.completions.create({
          model,
          messages,
          stream: true,
        });

        let updatedMessage = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          updatedMessage += content;
          await onNewChunk(updatedMessage);
        }
      } catch (error) {
        console.error('Error fetching AI stream:', error);
      }
    };

    ask();
  }, [shouldRequest, messages, onNewChunk, model]);
};

export default useAiStream;

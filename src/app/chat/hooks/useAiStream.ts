import OpenAI from 'openai';
import { useEffect, useRef } from 'react';
import { Message } from '../models/chat';
import { ResponsesModel } from 'openai/resources/index.mjs';
import { supportsThinking, ThinkingLevel } from '../utils/thinking';

const useAiStream = (
  shouldRequest: boolean,
  messages: Message[],
  onNewChunk: (content: string) => Promise<void>,
  model: ResponsesModel,
  thinkingLevel: ThinkingLevel,
  projectContext: string | null,
) => {
  const askedForTurnRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldRequest) {
      askedForTurnRef.current = null;

      return;
    }

    // A new `messages` array re-runs this effect, and editing a message makes
    // one without adding a turn, so pinning while a reply was on its way used to
    // ask for a second one. The question being answered identifies the turn:
    // pinning leaves it alone, and switching chats mid-question changes it.
    const turn = `${messages.length}:${messages.at(-1)?.content}`;

    if (askedForTurnRef.current === turn) return;

    askedForTurnRef.current = turn;

    const fetchApiKey = () => {
      if (typeof window === 'undefined') return;

      const apiKey = localStorage.getItem('key');

      if (!apiKey) {
        alert(
          'There is no OpenAI API key. Add it by pressing the key button in the header.',
        );

        return '';
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
        const stream = await openai.responses.create({
          model,
          // Carried outside the conversation, so a project's instructions are
          // never stored in it, rendered in it, or replayed as something the
          // visitor said.
          ...(projectContext && { instructions: projectContext }),
          // Reduced to the two fields the api knows. `isPinned` rides along on
          // the same objects and would be rejected as an unrecognised key.
          input: messages.map(({ role, content }) => ({ role, content })),
          stream: true,
          // Responses keeps the exchange for later retrieval unless told not
          // to, where chat completions did not. The conversation belongs in
          // this browser's IndexedDB and nowhere else.
          store: false,
          // Checked here as well as in the header, so that a model without
          // reasoning never carries the parameter and the 400 it would cause.
          ...(supportsThinking(model) && {
            reasoning: { effort: thinkingLevel },
          }),
        });

        let updatedMessage = '';

        // One request can emit reasoning, tool and lifecycle events alongside
        // the answer, so the text deltas are picked out rather than every
        // event being treated as content the way chat completion chunks were.
        for await (const event of stream) {
          if (event.type !== 'response.output_text.delta') continue;

          updatedMessage += event.delta;
          await onNewChunk(updatedMessage);
        }
      } catch (error) {
        console.error('Error fetching AI stream:', error);
      }
    };

    ask();
  }, [
    shouldRequest,
    messages,
    onNewChunk,
    model,
    thinkingLevel,
    projectContext,
  ]);
};

export default useAiStream;

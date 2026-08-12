import OpenAI from 'openai';
import { useEffect, useRef, useState } from 'react';
import { Citation, Message } from '../models/chat';
import { ResponsesModel } from 'openai/resources/index.mjs';
import { supportsThinking, ThinkingLevel } from '../utils/thinking';
import {
  describeSearchAction,
  SEARCH_GUIDANCE,
  supportsWebSearch,
  toCitation,
} from '../utils/webSearch';

const useAiStream = (
  shouldRequest: boolean,
  messages: Message[],
  onNewChunk: (content: string, citations: Citation[]) => Promise<void>,
  model: ResponsesModel,
  thinkingLevel: ThinkingLevel,
  projectContext: string | null,
) => {
  const askedForTurnRef = useRef<string | null>(null);
  // What the model is doing while it has nothing to show yet. Null whenever it
  // is answering out of what it already knows, which is most turns. Only ever
  // set from inside a running stream, and cleared when that stream ends, so
  // there is no state here to reset as the effect re-runs.
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

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

    const canSearch = supportsWebSearch(model);

    // Carried outside the conversation, so neither the guidance nor a project's
    // instructions are stored in it, rendered in it, or replayed as something
    // the visitor said. The project has the last word, so one that wants the
    // web checked on every question can say so and be listened to.
    const instructions = [canSearch ? SEARCH_GUIDANCE : null, projectContext]
      .filter(Boolean)
      .join('\n\n');

    const ask = async () => {
      try {
        const stream = await openai.responses.create({
          model,
          ...(instructions && { instructions }),
          // Reduced to the two fields the api knows. `isPinned` rides along on
          // the same objects and would be rejected as an unrecognised key.
          input: messages.map(({ role, content }) => ({ role, content })),
          // Left on `auto`, the choice the api makes for a tool it is given, so
          // the model reaches for the web when the question wants it and
          // answers from what it knows when it does not. `SEARCH_GUIDANCE` is
          // what makes that judgement anything like ChatGPT's.
          ...(canSearch && { tools: [{ type: 'web_search' as const }] }),
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
        const citations: Citation[] = [];

        // One request can emit reasoning, tool and lifecycle events alongside
        // the answer, so the interesting ones are picked out rather than every
        // event being treated as content the way chat completion chunks were.
        for await (const event of stream) {
          // The events named after the search itself carry nothing but its id,
          // so what the model is doing has to come off the item. `added` opens
          // the call, usually before it can say more than that it is searching,
          // and `done` closes it knowing the queries it ran or the page it
          // opened, which is worth reporting while the model reads the results.
          if (
            (event.type === 'response.output_item.added' ||
              event.type === 'response.output_item.done') &&
            event.item.type === 'web_search_call'
          ) {
            setSearchStatus(describeSearchAction(event.item.action));
          }

          // Sent separately from the text they credit, and after it, carrying
          // the span of the reply each one belongs to. Copied on the way out
          // because the array is still being filled after it is handed over.
          if (event.type === 'response.output_text.annotation.added') {
            const citation = toCitation(event.annotation);

            if (citation) {
              citations.push(citation);
              await onNewChunk(updatedMessage, [...citations]);
            }
          }

          if (event.type === 'response.output_text.delta') {
            // The answer arriving is what ends the searching, rather than the
            // event that completes a call: a model that is going to search
            // three times sends that one twice with more work still to come.
            setSearchStatus(null);
            updatedMessage += event.delta;
            await onNewChunk(updatedMessage, [...citations]);
          }
        }
      } catch (error) {
        console.error('Error fetching AI stream:', error);
      } finally {
        setSearchStatus(null);
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

  return searchStatus;
};

export default useAiStream;

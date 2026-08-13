import OpenAI from 'openai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Citation, Message } from '../models/chat';
import { ResponsesModel } from 'openai/resources/index.mjs';
import { ResponseUsage } from 'openai/resources/responses/responses.mjs';
import {
  supportsThinking,
  ThinkingLevel,
  thinkingLevelFor,
} from '../utils/thinking';
import { toInput } from '../utils/attachments';
import {
  describeSearchAction,
  SEARCH_GUIDANCE,
  supportsWebSearch,
  toCitation,
} from '../utils/webSearch';

export type AiStream = {
  searchStatus: string | null;
  isStreaming: boolean;
  isStopped: boolean;
  error: string | null;
  stop: () => void;
  restart: () => void;
};

// What went wrong, in the words of someone who has to do something about it.
// The api's own message is the fallback rather than the first choice: it is
// written for whoever wrote the request, not whoever is sitting in front of it.
function describeError(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
      return 'openai refused that key. check it under manage key.';
    }

    if (error.status === 429) {
      return 'too many requests, or the key is out of credit.';
    }

    if (error.status === 404) {
      return 'that model is not available on this key.';
    }

    return error.message;
  }

  return 'could not reach openai. check your connection and try again.';
}

// What the next question will carry, which is not the same as what this one
// cost. The reply is appended to the conversation and goes up with it, but the
// thinking behind the reply is not kept and is not sent again, so it is
// counted here and taken back off.
function carriedForward(usage: ResponseUsage | undefined): number | null {
  if (!usage) return null;

  const reasoning = usage.output_tokens_details?.reasoning_tokens ?? 0;

  return usage.input_tokens + usage.output_tokens - reasoning;
}

const useAiStream = (
  shouldRequest: boolean,
  messages: Message[],
  onNewChunk: (content: string, citations: Citation[]) => Promise<void>,
  model: ResponsesModel,
  thinkingLevel: ThinkingLevel,
  instructions: string | null,
  onUsage: (tokens: number) => Promise<void>,
): AiStream => {
  const askedForTurnRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // What the model is doing while it has nothing to show yet. Null whenever it
  // is answering out of what it already knows, which is most turns. Only ever
  // set from inside a running stream, and cleared when that stream ends, so
  // there is no state here to reset as the effect re-runs.
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Asking the same question twice is not a change to the question, so there is
  // nothing in the conversation for the effect to notice. This is the notice.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!shouldRequest) {
      askedForTurnRef.current = null;

      return;
    }

    // A new `messages` array re-runs this effect, and editing a message makes
    // one without adding a turn, so pinning while a reply was on its way used to
    // ask for a second one. The question being answered identifies the turn:
    // pinning leaves it alone, and switching chats mid-question changes it.
    const turn = `${attempt}:${messages.length}:${messages.at(-1)?.content}`;

    if (askedForTurnRef.current === turn) return;

    askedForTurnRef.current = turn;

    // Not aborted when this effect is cleaned up. Every chunk is saved, which
    // makes a new `messages` array, which re-runs the effect: a stream that
    // stopped on cleanup would stop itself on its own first word. Only the stop
    // button ends one early.
    const controller = new AbortController();

    abortRef.current = controller;

    const ask = async () => {
      setIsStreaming(true);
      setIsStopped(false);
      setError(null);

      const apiKey =
        typeof window === 'undefined' ? null : localStorage.getItem('key');

      if (!apiKey) {
        setError('there is no openai key yet. add one under manage key.');
        setIsStreaming(false);

        return;
      }

      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const canSearch = supportsWebSearch(model);

      // Carried outside the conversation, so none of the guidance is stored in
      // it, rendered in it, or replayed as something the visitor said.
      const allInstructions = [canSearch ? SEARCH_GUIDANCE : null, instructions]
        .filter(Boolean)
        .join('\n\n');

      try {
        const stream = await openai.responses.create(
          {
            model,
            ...(allInstructions && { instructions: allInstructions }),
            input: messages.map(toInput),
            // Left on `auto`, the choice the api makes for a tool it is given,
            // so the model reaches for the web when the question wants it and
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
            // The level is checked against the model for the same reason: not
            // every one of them takes all six.
            ...(supportsThinking(model) && {
              reasoning: { effort: thinkingLevelFor(model, thinkingLevel) },
            }),
          },
          { signal: controller.signal },
        );

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

          // Arrives once, after the last of the text, and is the only honest
          // count of the conversation: everything else would be this app
          // guessing at a tokeniser it does not have.
          if (event.type === 'response.completed') {
            const tokens = carriedForward(event.response.usage);

            if (tokens !== null) {
              await onUsage(tokens);
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
        // Asked for, so there is nothing to report beyond the fact of it.
        // Whatever had arrived by then is already saved and stays in the
        // conversation.
        if (error instanceof OpenAI.APIUserAbortError) {
          setIsStopped(true);
        } else {
          console.error('Error fetching AI stream:', error);
          setError(describeError(error));
        }
      } finally {
        setSearchStatus(null);
        setIsStreaming(false);
      }
    };

    ask();
  }, [
    shouldRequest,
    messages,
    onNewChunk,
    model,
    thinkingLevel,
    instructions,
    onUsage,
    attempt,
  ]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  // For asking again after a failure, and for a reply thrown away to be
  // regenerated. Both leave the conversation saying what it already said, so
  // the turn has to be forgotten before it will be asked a second time.
  const restart = useCallback(() => {
    askedForTurnRef.current = null;
    setError(null);
    setAttempt((previous) => previous + 1);
  }, []);

  return { searchStatus, isStreaming, isStopped, error, stop, restart };
};

export default useAiStream;

import React, { useState, useEffect } from 'react';
import { Model, ResponsesModel } from 'openai/resources/index.mjs';
import OpenAI from 'openai';
import { Spinner } from '../../../components/spinner/Spinner';

interface ModelSelectProps {
  model: ResponsesModel;
  setModel: (model: ResponsesModel) => void;
}

// The models endpoint returns no capability metadata, so what a model answers
// with can only be inferred from its id.
const UNSUPPORTED_MODEL_PATTERNS = [
  'audio',
  'realtime',
  'transcribe',
  'tts',
  'whisper',
  'image',
  'dall-e',
  'sora',
  'embedding',
  'moderation',
  'babbage',
  'davinci',
  'instruct',
  // The three below answer through Responses, so the api is no longer what
  // rules them out. Codex expects `phase` back on every assistant message it is
  // replayed, and a `Message` has nowhere to keep it; the other two are driven
  // by tools this chat does not send.
  'codex',
  'computer-use',
  'deep-research',
  // Shut down 2026-07-23. `gpt-5-search-api` replaces it and is not matched.
  'search-preview',
];

// Recognised families, not an allowlist. A model that clears the patterns above
// but matches nothing here is shown under `other` rather than dropped: OpenAI
// ships chat models under new prefixes (`daybreak-*`), and hiding one leaves no
// way to tell an unreleased model apart from a stale pattern list.
const KNOWN_CHAT_MODEL_PREFIXES = [
  'gpt-',
  'chatgpt-',
  'chat-latest',
  'o1',
  'o3',
  'o4',
];

function isOffered(id: string): boolean {
  if (UNSUPPORTED_MODEL_PATTERNS.some((pattern) => id.includes(pattern)))
    return false;

  // Also reachable now, and also held back: a pro model can spend minutes on a
  // question, which wants background mode rather than a stream left open, and
  // `gpt-5-pro` takes `high` alone where the header offers three levels.
  return !id.endsWith('-pro');
}

function isKnownChatFamily(id: string): boolean {
  return KNOWN_CHAT_MODEL_PREFIXES.some((prefix) => id.startsWith(prefix));
}

const SIX_MONTHS_IN_SECONDS = 182 * 24 * 60 * 60;

interface GroupedModels {
  latest: ResponsesModel[];
  other: ResponsesModel[];
  legacy: ResponsesModel[];
}

// `created` is when the model object was made, not when it was announced. An
// alias such as `gpt-4o` keeps its original timestamp when it is repointed at a
// newer snapshot, so it can land in legacy while the snapshot it resolves to is
// current.
function groupModels(models: Model[]): GroupedModels {
  const legacyBefore = Date.now() / 1000 - SIX_MONTHS_IN_SECONDS;
  const grouped: GroupedModels = { latest: [], other: [], legacy: [] };

  const newestFirst = [...models].sort((a, b) => b.created - a.created);

  for (const model of newestFirst) {
    if (!isOffered(model.id)) continue;

    if (!isKnownChatFamily(model.id)) {
      grouped.other.push(model.id);
    } else if (model.created >= legacyBefore) {
      grouped.latest.push(model.id);
    } else {
      grouped.legacy.push(model.id);
    }
  }

  return grouped;
}

function getDefaultModels(): GroupedModels {
  return { latest: ['gpt-4o', 'gpt-4o-mini'], other: [], legacy: [] };
}

const ModelOptionGroup: React.FC<{
  label: string;
  models: ResponsesModel[];
}> = ({ label, models }) => {
  if (models.length === 0) return null;

  return (
    <optgroup label={label}>
      {models.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </optgroup>
  );
};

const ModelSelect: React.FC<ModelSelectProps> = ({ model, setModel }) => {
  const [models, setModels] = useState<GroupedModels>(getDefaultModels);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const apiKey = localStorage.getItem('key');

    if (!apiKey) return;

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const fetchModels = async () => {
      try {
        setIsLoading(true);
        const response = await openai.models.list();
        setModels(groupModels(response.data));
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setModel(e.target.value);
    localStorage.setItem('model', e.target.value);
  }

  // Pinning the selection also covers a saved model that the filters drop,
  // which would otherwise leave the select with a value matching no option and
  // render it blank.
  const withoutSelection = (ids: ResponsesModel[]) =>
    ids.filter((id) => id !== model);

  // A fragment rather than a box of its own, so the select and the spinner are
  // laid out by the header's row and the select can be given the space left
  // over in it.
  return (
    <>
      <select
        // Takes what the header has spare and shrinks past it on a narrow
        // screen, truncating the model name rather than pushing the controls
        // either side off the edge. Capped, because past the length of the
        // longest model id the extra width says nothing.
        //
        // A select is as wide as its widest option unless it is told otherwise,
        // and the options here are model ids, so the basis has to come from
        // somewhere other than the content.
        className="max-w-64 min-w-0 grow basis-0 cursor-pointer rounded-md bg-slate-700 px-2 py-1 text-center text-ellipsis transition-all hover:bg-slate-800"
        value={model}
        title={model}
        onChange={handleChange}
      >
        <ModelOptionGroup label="Current" models={[model]} />
        <ModelOptionGroup
          label="Latest"
          models={withoutSelection(models.latest)}
        />
        <ModelOptionGroup
          label="Other"
          models={withoutSelection(models.other)}
        />
        <ModelOptionGroup
          label="Legacy"
          models={withoutSelection(models.legacy)}
        />
      </select>

      {/* In the flow rather than hung off the right edge, which used to be empty
          space and is now the thinking level. */}
      {isLoading && (
        <div className="h-5 w-5 shrink-0">
          <Spinner />
        </div>
      )}
    </>
  );
};

export default ModelSelect;

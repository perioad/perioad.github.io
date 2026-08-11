import React, { useState, useEffect } from 'react';
import { ChatModel, Model } from 'openai/resources/index.mjs';
import OpenAI from 'openai';
import { Spinner } from '../../../components/spinner/Spinner';

interface ModelSelectProps {
  model: ChatModel;
  setModel: (model: ChatModel) => void;
}

// The models endpoint returns no capability metadata, so the endpoint a model
// serves can only be inferred from its id.
const NON_CHAT_MODEL_PATTERNS = [
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

function servesChatCompletions(id: string): boolean {
  if (NON_CHAT_MODEL_PATTERNS.some((pattern) => id.includes(pattern)))
    return false;

  // Pro variants are served through the Responses API only.
  return !id.endsWith('-pro');
}

function isKnownChatFamily(id: string): boolean {
  return KNOWN_CHAT_MODEL_PREFIXES.some((prefix) => id.startsWith(prefix));
}

const SIX_MONTHS_IN_SECONDS = 182 * 24 * 60 * 60;

interface GroupedModels {
  latest: ChatModel[];
  other: ChatModel[];
  legacy: ChatModel[];
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
    if (!servesChatCompletions(model.id)) continue;

    const id = model.id as ChatModel;

    if (!isKnownChatFamily(model.id)) {
      grouped.other.push(id);
    } else if (model.created >= legacyBefore) {
      grouped.latest.push(id);
    } else {
      grouped.legacy.push(id);
    }
  }

  return grouped;
}

function getDefaultModels(): GroupedModels {
  return { latest: ['gpt-4o', 'gpt-4o-mini'], other: [], legacy: [] };
}

const ModelOptionGroup: React.FC<{ label: string; models: ChatModel[] }> = ({
  label,
  models,
}) => {
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
    setModel(e.target.value as ChatModel);
    localStorage.setItem('model', e.target.value);
  }

  // Pinning the selection also covers a saved model that the filters drop,
  // which would otherwise leave the select with a value matching no option and
  // render it blank.
  const withoutSelection = (ids: ChatModel[]) =>
    ids.filter((id) => id !== model);

  return (
    <div className="relative flex items-center gap-2">
      <select
        className="w-36 cursor-pointer rounded-md bg-slate-700 px-2 py-1 text-center text-ellipsis transition-all hover:bg-slate-800"
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

      {isLoading && (
        <div className="absolute top-1/2 -right-8 h-5 w-5 -translate-y-1/2">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default ModelSelect;

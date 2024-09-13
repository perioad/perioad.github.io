import React, { useState, useEffect } from 'react';
import { ChatModel } from 'openai/resources/index.mjs';
import OpenAI from 'openai';
import { Spinner } from '../../../components/spinner/Spinner';

interface ModelSelectProps {
  model: ChatModel;
  setModel: (model: ChatModel) => void;
}

function getDefaultModels(): ChatModel[] {
  const models: ChatModel[] = ['gpt-4o', 'gpt-4o-mini'];

  if (typeof window === 'undefined') return models;

  const savedModel = localStorage.getItem('model');

  if (savedModel) {
    models.unshift(savedModel as ChatModel);
  }

  return models;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ model, setModel }) => {
  const [models, setModels] = useState<ChatModel[]>(getDefaultModels);
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
        const models = await openai.models.list();
        const chatModels = models.data
          .filter((model) => model.id.startsWith('gpt-'))
          .sort((a, b) => b.created - a.created)
          .map((model) => model.id) as ChatModel[];
        setModels(chatModels);
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

  return (
    <div className="relative flex items-center gap-2">
      <select
        className="w-36 cursor-pointer text-ellipsis rounded-md bg-slate-700 px-2 py-1 text-center transition-all hover:bg-slate-800"
        value={model}
        title={model}
        onChange={handleChange}
      >
        {models.map((modelOption, index) => (
          <option key={index} value={modelOption}>
            {modelOption}
          </option>
        ))}
      </select>

      {isLoading && (
        <div className="absolute -right-8 top-1/2 h-5 w-5 -translate-y-1/2">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default ModelSelect;

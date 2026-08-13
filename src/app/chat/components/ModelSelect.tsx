import React, { useState, useEffect, useCallback } from 'react';
import { ResponsesModel } from 'openai/resources/index.mjs';
import OpenAI from 'openai';
import { Spinner } from '../../../components/spinner/Spinner';
import {
  DEFAULT_MODEL,
  isCurrentGeneration,
  offeredModels,
} from '../utils/models';

interface ModelSelectProps {
  model: ResponsesModel;
  setModel: (model: ResponsesModel) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ model, setModel }) => {
  // Something to show before the list arrives, and everything to show if it
  // never does.
  const [models, setModels] = useState<ResponsesModel[]>([DEFAULT_MODEL]);
  const [isLoading, setIsLoading] = useState(false);

  const chooseModel = useCallback(
    (id: ResponsesModel) => {
      setModel(id);
      localStorage.setItem('model', id);
    },
    [setModel],
  );

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
        const offered = offeredModels(response.data);
        const saved = localStorage.getItem('model');

        setModels(offered);

        // A model chosen before this list narrowed, and no longer on it. It
        // would otherwise sit pinned at the top of the select for good, since
        // nothing but picking something else clears it, and a default nobody
        // is moved onto is a default in name only. Only when the list is the
        // current generation: the fallback below it is what a key without
        // sight of that generation gets, and the default is no use there.
        if (
          saved &&
          !offered.includes(saved) &&
          offered.every(isCurrentGeneration)
        ) {
          chooseModel(DEFAULT_MODEL);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [chooseModel]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    chooseModel(e.target.value);
  }

  // A chat carried over from before this list narrowed is still on whichever
  // model it was using, and a select whose value matches no option renders
  // blank. Pinning it keeps the name visible and keeps the choice available
  // until something else is picked.
  const isRetired = !models.includes(model);

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
        {isRetired && <option value={model}>{model}</option>}

        {models.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
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

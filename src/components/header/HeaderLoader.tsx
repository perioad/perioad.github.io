import { useAliveContext } from '../../context/AliveContext';
import { Spinner } from '../spinner/Spinner';

export const HeaderLoader = () => {
  const { isAppAlive } = useAliveContext();

  if (isAppAlive) {
    return null;
  }

  return (
    <div className="h-8 w-8 sm:h-10 sm:w-10">
      <Spinner />
    </div>
  );
};

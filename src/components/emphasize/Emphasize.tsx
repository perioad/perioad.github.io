import { FC, PropsWithChildren } from 'react';

export const Emphasize: FC<PropsWithChildren> = ({ children }) => {
  return <span className="text-pink-500">{children}</span>;
};

import { FC, useEffect, useState } from 'react';

type Props = {
  messages: string[];
};

export const EntertainUntilInteractive: FC<Props> = ({ messages }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => {
        if (prevIndex === messages.length - 1) {
          return 0;
        }

        return prevIndex + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <p className="text-center">
      <span key={messageIndex} className="animate-appear">
        {messages[messageIndex]}
      </span>
    </p>
  );
};

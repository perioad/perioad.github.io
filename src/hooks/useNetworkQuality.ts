import { useEffect, useState } from 'react';

export function useNetworkQualityGood() {
  const [isNetworkQualityGood, setIsNetworkQualityGood] = useState(false);

  useEffect(() => {
    // @ts-expect-error
    const connection = navigator.connection;

    if (connection) {
      setIsNetworkQualityGood(connection.effectiveType === '4g');
    } else {
      setIsNetworkQualityGood(true);
    }
  }, []);

  return isNetworkQualityGood;
}

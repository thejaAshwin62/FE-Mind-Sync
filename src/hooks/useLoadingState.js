import { useState, useCallback, useEffect } from 'react';

export const useLoadingState = (delay = 0) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setTimeout(handleLoad, delay);
    });
    return () => {
      cancelAnimationFrame(timer);
    };
  }, [handleLoad, delay]);

  return isLoaded;
}; 
import { useState, useEffect, useCallback } from 'react';

const getCurrentRoute = () => window.location.hash.replace(/^#/, '') || '/';

export const useRouter = () => {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getCurrentRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const navigate = useCallback((path: string) => {
      window.location.hash = path;
  }, []);

  // Extract path and query params from route
  const [path, queryStr] = route.split('?');
  const queryParams = new URLSearchParams(queryStr);

  return { route, path, queryParams, navigate };
};
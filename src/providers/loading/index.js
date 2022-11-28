import { Backdrop, CircularProgress } from '@mui/material';
import { useMemo , createContext, useContext, useState } from 'react';
import { useGapi } from '../gapi';

const LoadingContext = createContext({});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState();
  const { gapiLoaded, gsiLoaded } = useGapi();

  const showSpinner = isLoading || !gapiLoaded || !gsiLoaded

  const contextValues = useMemo(() => ({showSpinner, setIsLoading}), [isLoading, showSpinner])

  return (
    <LoadingContext.Provider
      value={contextValues}
    >
      {showSpinner && (
        <Backdrop
          open={isLoading}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

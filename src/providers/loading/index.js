import { Backdrop, CircularProgress } from '@mui/material';
import { createContext, useContext, useState } from 'react';
import { useAuth } from '../auth';

const LoadingContext = createContext({});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState();
  const { gapiLoaded, gsiLoaded } = useAuth();

  const showSpinner = isLoading || !gapiLoaded || !gsiLoaded;

  return (
    <LoadingContext.Provider
      value={{
        isLoading: showSpinner,
        setIsLoading,
      }}
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

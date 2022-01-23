import { Backdrop, CircularProgress } from '@mui/material';
import { createContext, useContext, useState } from 'react';
import { useAuth } from '../auth';

const LoadingContext = createContext({});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState();
  const { gapiLoaded } = useAuth();

  const showSpinner = isLoading || !gapiLoaded;

  return (
    <LoadingContext.Provider
      value={{
        isLoading: showSpinner,
        setIsLoading,
      }}
    >
      {showSpinner ? (
        <Backdrop open={isLoading}>
          <CircularProgress color="secondary" />
        </Backdrop>
      ) : (
        children
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

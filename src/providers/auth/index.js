import { createContext, useContext, useEffect, useState } from 'react';
import loadScript from 'load-script';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);

  const handleCredentialResponse = (data) => {
    localStorage.setItem('aggregator_token', data?.credential);
  };

  useEffect(() => {
    loadScript('https://accounts.google.com/gsi/client', () => {
      const { google } = window;

      if (google) {
        google?.accounts?.id?.initialize({
          client_id: process.env.REACT_APP_GMAIL_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        setGapiLoaded(true);
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        setIsSignedIn,
        gapiLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContext = useContext(AuthContext);

  return {
    ...authContext,
  };
};

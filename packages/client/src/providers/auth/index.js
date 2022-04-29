import { createContext, useContext, useEffect, useState } from 'react';
import loadScript from 'load-script';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';

const AuthContext = createContext({});

const apiUrl = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const navigate = useNavigate();

  const handleCredentialResponse = (data) => {
    if (data?.credential) {
      setIsSignedIn(true);
      localStorage.setItem('aggregator_token', data?.credential);
      navigate(routes.main);
    }
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

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('aggregator_token');

      if (token) {
        try {
          await fetch(`${apiUrl}/verify/${token}`);

          setIsSignedIn(true);
        } catch (err) {
          console.error(err);
          setIsSignedIn(false);
        }
      } else {
        setIsSignedIn(false);
      }
    };

    verifyToken();
  }, [gapiLoaded]);

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

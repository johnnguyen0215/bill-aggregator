import { createContext, useContext, useEffect, useState } from 'react';
import loadScript from 'load-script';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';

const AuthContext = createContext({});

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState();

  const navigate = useNavigate();

  const initializeGapiClient = async () => {
    const { gapi } = window;

    await gapi.client.init({
      apiKey: process.env.REACT_APP_GMAIL_API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });

    setGapiLoaded(true);
  };

  const handleSignOut = () => {};

  useEffect(() => {
    loadScript('https://accounts.google.com/gsi/client', () => {
      const { google } = window;

      if (google) {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: process.env.REACT_APP_GMAIL_CLIENT_ID,
          scope: SCOPES,
        });

        setTokenClient(tokenClient);
        setGsiLoaded(true);
      }
    });

    loadScript('https://apis.google.com/js/api.js', async () => {
      const { gapi } = window;

      gapi.load('client', initializeGapiClient);
    });
  }, []);

  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem('aggregator_token'));

    if (accessToken && gapiLoaded) {
      const { gapi } = window;

      gapi.client.setToken(accessToken);
      setIsSignedIn(true);
      navigate(routes.main);
    }
  }, [navigate, gapiLoaded]);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        setIsSignedIn,
        gapiLoaded,
        gsiLoaded,
        tokenClient,
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

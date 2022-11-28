import { createContext , useContext, useEffect, useMemo, useState } from "react";
import loadScript from 'load-script';

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

const GapiContext = createContext({});

export const GapiProvider = ({ children }) => {
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState();

  const initializeGapiClient = async () => {
    const { gapi } = window;

    await gapi.client.init({
      apiKey: process.env.REACT_APP_GMAIL_API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });

    setGapiLoaded(true);
  };

  useEffect(() => {
    loadScript('https://accounts.google.com/gsi/client', () => {
      const { google } = window;

      if (google) {
        console.log('Client ID: ', process.env.REACT_APP_GMAIL_CLIENT_ID)
        const token = google.accounts.oauth2.initTokenClient({
          client_id: process.env.REACT_APP_GMAIL_CLIENT_ID,
          scope: SCOPES,
        });

        console.log('Token: ', token)

        setTokenClient(token);
        setGsiLoaded(true);
      }
    });

    loadScript('https://apis.google.com/js/api.js', async () => {
      const { gapi } = window;

      gapi.load('client', initializeGapiClient);
    });
  }, []);

  const contextValues = useMemo(() => ({gapiLoaded,gsiLoaded,tokenClient}), [gapiLoaded,gsiLoaded,tokenClient])

  return (
    <GapiContext.Provider
      value={contextValues}
    >
      {children}
    </GapiContext.Provider>
  );
}

export const useGapi = () => {
  const gapiContext = useContext(GapiContext);

  return {
    ...gapiContext,
  };
};


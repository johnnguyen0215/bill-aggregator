import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';
import { useLoading } from '../loading';
import { useGapi } from '../gapi';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const {gapiLoaded} = useGapi();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { setIsLoading } = useLoading();

  const navigate = useNavigate();
  const signout = () => {
    setIsLoading(false);
    localStorage.removeItem('aggregator_token');
    setIsSignedIn(false);
    navigate(routes.signin);
  };

  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem('aggregator_token'));

    if (accessToken && gapiLoaded) {
      const { gapi } = window;

      gapi.client.setToken(accessToken);
      setIsSignedIn(true);
      navigate(routes.main);
    }
  }, [navigate, gapiLoaded]);

  const contextValues = useMemo(() => ({isSignedIn, setIsSignedIn, signout}), [isSignedIn, setIsSignedIn, signout])

  return (
    <AuthContext.Provider
      value={contextValues}
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

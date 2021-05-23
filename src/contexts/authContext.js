import { createContext } from 'react';

const AuthContext = createContext({
  isSignedIn: false,
  setIsSignedIn: () => {},
});

export default AuthContext;

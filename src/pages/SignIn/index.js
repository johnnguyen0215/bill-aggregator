import { useEffect, useRef } from 'react';
import { useAuth } from '../../providers/auth';
import styles from './styles.module.css';

export const SignIn = () => {
  const signinButton = useRef();
  const { isSignedIn, gapiLoaded } = useAuth();

  useEffect(() => {
    if (signinButton.current) {
      const { google } = window;

      google.accounts.id.renderButton(signinButton.current, {
        theme: 'outline',
        size: 'large',
      });

      google.accounts.id.prompt();
    }
  }, [isSignedIn, signinButton, gapiLoaded]);

  return (
    <div className={styles.container}>
      <div className="google-signin-button" ref={signinButton} />
    </div>
  );
};

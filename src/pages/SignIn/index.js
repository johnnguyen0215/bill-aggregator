import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useAuth } from '../../providers/auth';
import styles from './styles.module.css';
import { routes } from '../../router/routes';
import { useGapi } from '../../providers/gapi';

export const SignIn = () => {
  const { setIsSignedIn } = useAuth();
  const { tokenClient } = useGapi();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (tokenClient) {
      const { gapi } = window;

      tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          throw resp;
        }

        const token = gapi.client.getToken();

        setIsSignedIn(true);
        localStorage.setItem('aggregator_token', JSON.stringify(token));
        navigate(routes.main);
      };

      if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
      }
    }
  };

  return (
    <div className={styles.container}>
      <Button
        size="large"
        color="primary"
        variant="outlined"
        onClick={handleAuthClick}
      >
        Sign In with Google
      </Button>
    </div>
  );
};

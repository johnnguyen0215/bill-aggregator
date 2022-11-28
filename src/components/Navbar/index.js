import { Button, AppBar, Toolbar } from '@mui/material';
import { useAuth } from '../../providers/auth';
import styles from './styles.module.css';

export const NavBar = () => {
  const { isSignedIn, signout } = useAuth();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <div className={styles.buttonContainer}>
          {isSignedIn && (
            <Button
              className="signoutButton"
              variant="outlined"
              onClick={signout}
              color="secondary"
            >
              Sign Out
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}


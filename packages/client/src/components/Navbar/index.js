import { Button, AppBar, Toolbar } from '@mui/material';
import { useAuth } from '../../providers/auth';
import styles from './styles.module.css';

function NavBar() {
  const { isSignedIn, handleSignout } = useAuth();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <div className={styles.buttonContainer}>
          {isSignedIn && (
            <Button
              className="signoutButton"
              variant="contained"
              onClick={handleSignout}
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

export default NavBar;

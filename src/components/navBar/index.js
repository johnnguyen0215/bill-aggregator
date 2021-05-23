import { AppBar, Toolbar, Button } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { useContext } from 'react';
import useStyles from '../../customHooks/useStyles';
import DrawerContext from '../../contexts/drawerContext';
import LoadingContext from '../../contexts/loadingContext';
import AuthContext from '../../contexts/authContext';
import useGapi from '../../customHooks/useGapi';

function NavBar() {
  const drawerContext = useContext(DrawerContext);
  const gapi = useGapi();

  const { setPending } = useContext(LoadingContext);
  const { isSignedIn, setIsSignedIn } = useContext(AuthContext);

  const classes = useStyles();
  const appBarClasses = isSignedIn ? classes.appBar : null;

  const handleSignout = async () => {
    setPending(true);
    await gapi.auth2.getAuthInstance().signOut();
    setIsSignedIn(false);
  };

  return (
    <AppBar position="fixed" className={appBarClasses}>
      <Toolbar className="toolbar">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => drawerContext.setDrawerOpen(!drawerContext.drawerOpen)}
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Button
          className="signoutButton"
          variant="contained"
          onClick={handleSignout}
          color="secondary"
        >
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;

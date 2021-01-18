import { Button, AppBar, Toolbar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { useContext, useEffect } from 'react';
import useStyles from '../../customHooks/useStyles';
import DrawerContext from '../../contexts/drawerContext';

function NavBar(props) {
  const { isSignedIn, handleSignin, handleSignout, gapi } = props;
  const drawerContext = useContext(DrawerContext);

  const classes = useStyles();

  useEffect(() => {
    if (!isSignedIn) {
      gapi.signin2.render('google-signin-button', {
        scope: 'profile email',
        width: 240,
        height: 50,
        longtitle: true,
        theme: 'dark',
      });
    }
  }, [isSignedIn]);

  const appBarClasses = isSignedIn ? classes.appBar : null;

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
        <div className="buttonContainer">
          {!isSignedIn ? (
            <div
              role="button"
              tabIndex="0"
              id="google-signin-button"
              onClick={handleSignin}
              onKeyDown={handleSignin}
            />
          ) : (
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

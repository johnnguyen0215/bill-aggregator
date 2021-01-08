import { Button, AppBar, Toolbar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import useStyles from '../../customHooks/useStyles';
import DrawerContext from '../../contexts/drawerContext';
import {useContext} from 'react';

function NavBar(props) {
  const {isSignedIn, handleSignin, handleSignout} = props;
  const drawerContext = useContext(DrawerContext);

  const classes = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar}>
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
          {
            isSignedIn !== null && (!isSignedIn ?
              <div id="google-signin-button" onClick={handleSignin} /> :
              <Button className="signoutButton" variant="contained" onClick={handleSignout} color="secondary">Sign Out</Button>)
          }
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar;
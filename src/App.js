import './App.css';
import { useEffect, useCallback, useState, useRef } from 'react';
import { Button, Container, Backdrop, CircularProgress, AppBar, Toolbar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AggregatorPage from './components/aggregatorPage/index';
import useStyles from './customHooks/useStyles';
import NavDrawer from './components/navDrawer/index';
import DrawerContext from './contexts/drawerContext';

const gapi = window.gapi;

function App() {
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [pending, setPending] = useState(false);
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const billsInfo = useRef({
    'socal-gas': {
      name: 'Socal Gas',
      id: 'socal-gas',
      email: 'customerservice@socalgas.com',
      subject: 'Your Bill from Southern California Gas Company'
    },
    'socal-edison': {
      name: 'Socal Edison',
      id: 'socal-edison',
      email: 'ibp3@scewebservices.com',
      subject: 'SCE Bill is Ready to View'
    },
    'geico': {
      name: 'Geico',
      id: 'geico',
      email: 'geico@email1.geico.com',
      subject: 'consider reviewing this pending GEICO payment'
    }
  })

  const initGapi = useCallback(async () => {
    await gapi.client.init({
      apiKey: process.env.REACT_APP_GMAIL_API_KEY,
      clientId: process.env.REACT_APP_GMAIL_CLIENT_ID,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
      scope: 'https://www.googleapis.com/auth/gmail.readonly'
    });

    gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
      setIsSignedIn(isSignedIn);
      setPending(false);
    });

    setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, []);

  const handleSignin = async () => {
    setPending(true);
    await gapi.auth2.getAuthInstance().signIn();
  }

  const handleSignout = async () => {
    setPending(true);
    await gapi.auth2.getAuthInstance().signOut();
  }

  useEffect(() => {
    if (gapi) {
      gapi.load('client:auth2', initGapi);
    }
  }, [initGapi]);

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
  }, [isSignedIn])

  return (
    <DrawerContext.Provider
      values={{
        setDrawerOpen,
        drawerOpen,
      }}
    >
      <div className="App">
        <Backdrop className="backdrop" open={pending}>
          <CircularProgress color="secondary" />
        </Backdrop>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar className="toolbar">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={setDrawerOpen(!drawerOpen)}
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
        <NavDrawer billsInfo={billsInfo.current}></NavDrawer>
        <main className={classes.content}>
          <Container>
            <div className={classes.toolbar}></div>
            <AggregatorPage isSignedIn={isSignedIn} billsInfo={billsInfo} gapi={gapi} />
          </Container>
        </main>
      </div>
    </DrawerContext.Provider>
  );
}

export default App;

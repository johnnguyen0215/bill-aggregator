import './App.css';
import { useEffect, useCallback, useState, useRef } from 'react';
import { Container, Backdrop, CircularProgress } from '@material-ui/core';
import AggregatorPage from './components/aggregatorPage/index';
import useStyles from './customHooks/useStyles';
import NavDrawer from './components/navDrawer/index';
import DrawerContext from './contexts/drawerContext';
import NavBar from './components/navBar/index';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import BillPage from './components/billPage/index';

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
    <Router>
      <DrawerContext.Provider
        value={{
          setDrawerOpen,
          drawerOpen,
        }}
      >
        <div className="App">
          <Backdrop className="backdrop" open={pending}>
            <CircularProgress color="secondary" />
          </Backdrop>
          <NavBar isSignedIn={isSignedIn} handleSignin={handleSignin} handleSignout={handleSignout} ></NavBar>
          <NavDrawer billsInfo={billsInfo.current}></NavDrawer>
          <main className={classes.content}>
            <Container>
              <div className={classes.toolbar}></div>
              <Switch>
                <Route path="/">
                  <AggregatorPage isSignedIn={isSignedIn} billsInfo={billsInfo} gapi={gapi} />
                </Route>
                {
                  billsInfo.current.map((billInfo) => {
                    return (
                      <Route path={billInfo.id}>
                        <BillPage billInfo={billInfo} />
                      </Route>
                    );
                  })
                }
              </Switch>
            </Container>
          </main>
        </div>
      </DrawerContext.Provider>
    </Router>
  );
}

export default App;

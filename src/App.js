import './App.css';
import { useState, useEffect } from 'react';
import { Container, Backdrop, CircularProgress } from '@material-ui/core';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/home';
import useStyles from './customHooks/useStyles';
import DrawerContext from './contexts/drawerContext';
import NavBar from './components/navBar';
import BillPage from './components/billPage';
import LoadingContext from './contexts/loadingContext';
import BillsContext from './contexts/billsContext';
import BillManager from './components/billManager';
import LoginPage from './pages/login';
import AuthContext from './contexts/authContext';
import useGapi from './customHooks/useGapi';
import NavDrawer from './components/navDrawer';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [pending, setPending] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [total, setTotal] = useState(null);
  const gapi = useGapi();
  const classes = useStyles();

  const [billsInfo, setBillsInfo] = useState({
    socal_gas: {
      name: 'Socal Gas',
      id: 'socal_gas',
      email: 'customerservice@socalgas.com',
      subject: 'Your Bill from Southern California Gas Company',
      type: 'email',
    },
    socal_edison: {
      name: 'Socal Edison',
      id: 'socal_edison',
      email: 'ibp3@scewebservices.com',
      subject: 'SCE Bill is Ready to View',
      type: 'email',
    },
    geico: {
      name: 'Geico',
      id: 'geico',
      email: 'geico@email1.geico.com',
      subject: 'consider reviewing this pending GEICO payment',
      type: 'email',
    },
  });

  useEffect(() => {
    const initGapi = async () => {
      await gapi.client.init({
        apiKey: process.env.REACT_APP_GMAIL_API_KEY,
        clientId: process.env.REACT_APP_GMAIL_CLIENT_ID,
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
        ],
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
      });

      gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn) => {
        setIsSignedIn(signedIn);
        setPending(false);
      });

      setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
      setGmailLoading(false);
    };

    if (gapi) {
      gapi.load('client:auth2', initGapi);
    }
  });

  return (
    <Router>
      <AuthContext.Provider
        value={{
          setIsSignedIn,
          isSignedIn,
        }}
      >
        <BillsContext.Provider
          value={{
            setBillsInfo,
            billsInfo,
            total,
            setTotal,
          }}
        >
          <LoadingContext.Provider
            value={{
              setPending,
              pending,
              setGmailLoading,
              gmailLoading,
            }}
          >
            <DrawerContext.Provider
              value={{
                setDrawerOpen,
                drawerOpen,
              }}
            >
              <Backdrop className="backdrop" open={pending || gmailLoading}>
                <CircularProgress color="secondary" />
              </Backdrop>
              {!gmailLoading && (
                <div className="App">
                  <NavBar />
                  {isSignedIn && <NavDrawer />}
                  <main className={classes.content}>
                    <Container>
                      <div className={classes.toolbar} />
                      <Switch>
                        <Route exact path="/login">
                          <LoginPage />
                        </Route>
                        <Route exact path="/">
                          <HomePage isSignedIn={isSignedIn} />
                        </Route>
                        <Route path="/bill_manager">
                          <BillManager />
                        </Route>
                        {Object.values(billsInfo).map((billInfo) => (
                          <Route
                            path={`/${billInfo.id}`}
                            key={`route-${billInfo.id}`}
                          >
                            <BillPage billInfo={billInfo} />
                          </Route>
                        ))}
                      </Switch>
                    </Container>
                  </main>
                </div>
              )}
            </DrawerContext.Provider>
          </LoadingContext.Provider>
        </BillsContext.Provider>
      </AuthContext.Provider>
    </Router>
  );
}

export default App;

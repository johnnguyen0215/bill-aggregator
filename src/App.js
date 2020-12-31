import './App.css';
import { useEffect, useCallback, useState } from 'react';

import { Button, Container, Backdrop, CircularProgress, AppBar, Toolbar } from '@material-ui/core';

const gapi = window.gapi;

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [pending, setPending] = useState(false);

  const initGapi = useCallback(async () => {
    await gapi.client.init({
      apiKey: process.env.REACT_APP_GMAIL_API_KEY,
      clientId: process.env.REACT_APP_GMAIL_CLIENT_ID,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
      scope: 'https://www.googleapis.com/auth/gmail.readonly'
    });

    gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
      console.log('Setting signed in value');
      console.log(isSignedIn);
      setIsSignedIn(isSignedIn);
      setPending(false);
    });

    setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, []);

  const handleGetMessages = async () => {
    const response = await gapi.client.gmail.users.messages.list({ userId: "me", maxResults: 10, q: "from:customerservice@socalgas.com"});
    const responseObject = JSON.parse(response.body);

    const messageId = responseObject.messages[0].id;
    const messageResponse = await gapi.client.gmail.users.messages.get({ userId: "me", id: messageId });

    const messageResponseBody = JSON.parse(messageResponse.body);

    const partData = messageResponseBody.payload.parts[0].body.data;

    const partBody = atob( partData.replace(/-/g, '+').replace(/_/g, '/') );

    const billAmount = parseFloat(partBody.match(/\$\s*\d*.\d{2}/)[0].slice(1));

    console.log(billAmount);
  }

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
    <div className="App">
      <AppBar position="static">
        <Toolbar className="toolbar">
          {
            !isSignedIn ?
            <div id="google-signin-button" onClick={handleSignin} /> :
            <Button variant="contained" onClick={handleSignout} color="secondary">Sign Out</Button>
          }
        </Toolbar>
      </AppBar>
      <Container>
        <h1>Bill Aggregator</h1>
        <div className="homePage">

          {
            isSignedIn &&
            (
              <>
                <Button variant="contained" onClick={handleGetMessages} color="secondary">Get Messages</Button>
              </>
            )
          }
        </div>
      </Container>
      <Backdrop className="backdrop" open={pending}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </div>
  );
}

export default App;

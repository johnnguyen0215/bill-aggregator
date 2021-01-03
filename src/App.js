import './App.css';
import { useEffect, useCallback, useState, useRef } from 'react';

import { Button, Container, Backdrop, CircularProgress, AppBar, Toolbar, TextField } from '@material-ui/core';

const gapi = window.gapi;

function App() {
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [pending, setPending] = useState(false);
  const [totalBill, setTotalBill] = useState(0);
  const [manualInputValue, setManualInputValue] = useState();

  const billsInfo = useRef([
    {
      email: 'customerservice@socalgas.com',
      subject: 'Your Bill from Southern California Gas Company'
    },
    {
      email: 'ibp3@scewebservices.com',
      subject: 'SCE Bill is Ready to View'
    },
    {
      email: 'geico@email1.geico.com',
      subject: 'consider reviewing this pending GEICO payment'
    }
  ])

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

  const isDateInRange = (dateStr) => {
    const today = new Date();

    const lastMonth = new Date();
    lastMonth.setDate(1);
    lastMonth.setMonth(lastMonth.getMonth()-1);

    //"Fri, 04 Dec 2020 06:34:42 +0000 (UTC)";
    const date = new Date(dateStr);

    return date <= today && date >= lastMonth;
  }

  const queryBuilder = (email, subject, afterDate, beforeDate) => {
    return `from:${email} AND subject:${subject}`;
  }

  // Algorithm, use the messages in between beginning of month to current date.
  // If two results are returned, take the later date.
  // If one result is returned and the date occurs before the middle of the month
  // then that is an old bill and should not be included in the final amount

  const handleGetTotalBill= async () => {
    setPending(true);

    let totalBillAmount = 0;

    for (let i = 0; i < billsInfo.current.length; i++) {
      const billInfo = billsInfo.current[i];

      const response = await gapi.client.gmail.users.messages.list(
        {
          userId: "me",
          maxResults: 10,
          q: queryBuilder(billInfo.email, billInfo.subject)
        });

      const responseObject = JSON.parse(response.body);

      const messageId = responseObject.messages[0].id;
      const messageResponse = await gapi.client.gmail.users.messages.get({ userId: "me", id: messageId });

      const messageResponseBody = JSON.parse(messageResponse.body);

      const dateHeader = messageResponseBody.payload.headers.find((header) => {
        return header.name === 'Date';
      });

      const date = dateHeader.value;

      if (isDateInRange(date)) {
        const partData = messageResponseBody.payload.parts[0].body.data;

        const partBody = atob(partData.replace(/-/g, '+').replace(/_/g, '/'));

        const billAmount = parseFloat(partBody.match(/\$\s*\d*.\d{2}/)[0].slice(1));

        setPending(false);

        totalBillAmount += billAmount;
      }
    }

    setPending(false);
    setTotalBill(totalBillAmount);
  }

  const handleSignin = async () => {
    setPending(true);
    await gapi.auth2.getAuthInstance().signIn();
  }

  const handleSignout = async () => {
    setPending(true);
    await gapi.auth2.getAuthInstance().signOut();
  }

  const handleInputOnChange = async (event) => {
    setManualInputValue(event.target.value);
  }

  const handleInputKeydown = async (event) => {
    console.log(event);
    if (event.key === 'Enter') {
      setTotalBill(totalBill + parseFloat(manualInputValue));
    }
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
      <Backdrop className="backdrop" open={pending}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <AppBar position="static">
        <Toolbar className="toolbar">
          {
            isSignedIn !== null && (!isSignedIn ?
            <div id="google-signin-button" onClick={handleSignin} /> :
            <Button variant="contained" onClick={handleSignout} color="secondary">Sign Out</Button>)
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
                <Button variant="contained" onClick={handleGetTotalBill} color="secondary">Get Total</Button>
              </>
            )
          }
        </div>
        <div className="manualInput">
          <TextField
            onChange={handleInputOnChange}
            onKeyDown={handleInputKeydown}
            value={manualInputValue}
            type="number"
          />
          <Button variant="contained" onClick={() => setTotalBill(manualInputValue + totalBill)} color="primary">Submit</Button>
          <Button variant="contained" onClick={() => setTotalBill(0)} color="primary">Clear</Button>
        </div>
        {
         !pending &&
          <div className="billTotals">
            <h2>Bill Total</h2>
            {
              totalBill ?
                totalBill :
                'No bills'
            }
          </div>
        }
      </Container>
    </div>
  );
}

export default App;

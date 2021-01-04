import './App.css';
import { useEffect, useCallback, useState, useRef } from 'react';

import { Button, Container, Backdrop, CircularProgress, AppBar, Toolbar, TextField, Tabs, Tab } from '@material-ui/core';

const gapi = window.gapi;

function TabPanel (props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`bill-tab-${index}`}
      {...other}
    >
      {value === index && (
        children
      )}
    </div>
  );
}

function App() {
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [pending, setPending] = useState(false);
  const [totalBill, setTotalBill] = useState(0);
  const [manualInputValue, setManualInputValue] = useState();
  const [tabValue, setTabValue] = useState(0);
  const [billAmounts, setBillAmounts] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

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

  const getMessageBody = async (billInfo) => {
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

      return partBody;
    }

    return false;
  }

  // Algorithm, use the messages in between beginning of month to current date.
  // If two results are returned, take the later date.
  // If one result is returned and the date occurs before the middle of the month
  // then that is an old bill and should not be included in the final amount
  const handleGetTotalBill= async () => {
    setPending(true);

    let totalBillAmount = 0;

    const billAmounts = [];

    const values = Object.values(billsInfo.current);

    for (let i = 0; i < values.length; i++) {
      const billInfo = values[i];

      const messageBody = await getMessageBody(billInfo);

      if (messageBody) {
        const billAmount = parseFloat(messageBody.match(/\$\s*\d*.\d{2}/)[0].slice(1));

        billAmounts.push({
          id: billInfo.id,
          amount: billAmount,
        });

        totalBillAmount += billAmount;
      }
    }

    setBillAmounts(billAmounts);
    setPending(false);
    setTotalBill(totalBill + totalBillAmount);
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
    if (event.key === 'Enter') {
      setTotalBill(parseFloat(totalBill) + parseFloat(manualInputValue));
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

  const handleTabsChange = async (event, newValue) => {
    setPending(true);

    if (newValue > 0) {
      const values = Object.values(billsInfo.current);

      const billIndex = newValue - 1;

      const billInfo = values[billIndex];

      const messageBody = await getMessageBody(billInfo);

      setCurrentMessage(messageBody);
    }

    setPending(false);
    setTabValue(newValue);
  }

  return (
    <div className="App">
      <Backdrop className="backdrop" open={pending}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <AppBar position="static">
        <Toolbar className="toolbar">
          {
            billsInfo.current &&
            (
              <Tabs className="billTabs" value={tabValue} onChange={handleTabsChange} aria-label="Change bill tab">
                <Tab label="aggregator page" id="aggregator-page" />
                {
                  billAmounts && billAmounts.length > 0 && Object.values(billsInfo.current).map((billInfo) => {
                    return (
                      <Tab label={billInfo.name} id={billInfo.id} />
                    );
                  })
                }
              </Tabs>
            )
          }
          {
            <div className="buttonContainer">
              {
                isSignedIn !== null && (!isSignedIn ?
                  <div id="google-signin-button" onClick={handleSignin} /> :
                  <Button className="signoutButton" variant="contained" onClick={handleSignout} color="secondary">Sign Out</Button>)
              }
            </div>
          }
        </Toolbar>
      </AppBar>
      <Container>
        <TabPanel value={tabValue} index={0}>
          <h1>Bill Aggregator</h1>
          <div className="homePage">
            {
              isSignedIn &&
              (
                <>
                  <Button variant="contained" onClick={handleGetTotalBill} color="secondary">Get Total</Button>
                  <div className="manualInput">
                    <div className="inputContainer">
                      <label htmlFor="manualInputField">Manual Input: $</label>
                      <TextField
                        id="manualInputField"
                        onChange={handleInputOnChange}
                        onKeyDown={handleInputKeydown}
                        value={manualInputValue}
                        type="number"
                      />
                    </div>
                    <div className="manualInputBtnContainer">
                      <Button variant="contained" onClick={() => setTotalBill(parseFloat(manualInputValue) + parseFloat(totalBill))} color="primary">Submit</Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setTotalBill(0);
                          setBillAmounts([]);
                        }}
                        color="primary"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </>
              )
            }
          </div>
          {
          !pending && billAmounts && billAmounts.length > 0 &&
            <div className="billsInfo">
              {
                billAmounts &&
                billAmounts.map((billAmount) => {
                  const billInfo = billsInfo.current[billAmount.id];

                  return (
                    <div className="billInfoContainer">
                      <label className="billInfoName">{billInfo.name}: </label>
                      <span>${billAmount.amount}</span>
                    </div>
                  )
                })
              }
              <div className="billsInfoContainer">
                <label className="billsInfoName">Total: </label>
                <span>
                  {
                    totalBill ?
                      `$${totalBill}` :
                      'No bills'
                  }
                </span>
              </div>
            </div>
          }
        </TabPanel>
        {
          billAmounts.map((billAmount, index) => {
            return (
              <TabPanel value={tabValue} index={index + 1}>
                <div>Total: {billAmount.amount}</div>
                {
                  currentMessage ?
                    (
                      <div
                        className="billHtml"
                        dangerouslySetInnerHTML={{
                          __html: currentMessage
                        }}
                      />
                    ) :
                    <div>No Bill could be found for payment period.</div>
                }
              </TabPanel>
            );
          })
        }
      </Container>
    </div>
  );
}

export default App;

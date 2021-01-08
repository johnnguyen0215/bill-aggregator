import { useState } from 'react';
import { Button, TextField } from '@material-ui/core';

function AggregatorPage (props) {
  const {gapi, isSignedIn, billsInfo} = props;

  const [pending, setPending] = useState(false);
  const [totalBill, setTotalBill] = useState(0);
  const [manualInputValue, setManualInputValue] = useState();
  const [billAmounts, setBillAmounts] = useState([]);

  const isDateInRange = (dateStr) => {
    const today = new Date();

    const lastMonth = new Date();
    lastMonth.setDate(1);
    lastMonth.setMonth(lastMonth.getMonth()-1);

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
      const htmlPart = messageResponseBody?.payload?.parts.find((part) => {
        return part.mimeType === 'text/html';
      })

      const partData = htmlPart.body.data;

      const partBody = atob(partData.replace(/-/g, '+').replace(/_/g, '/'));

      return partBody;
    }

    return false;
  }

  const handleInputOnChange = async (event) => {
    setManualInputValue(event.target.value);
  }

  const handleInputKeydown = async (event) => {
    if (event.key === 'Enter') {
      setTotalBill(parseFloat(totalBill) + parseFloat(manualInputValue));
    }
  }

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

  return (
    <>
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
    </>
  );
}

export default AggregatorPage;
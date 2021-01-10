import { useContext, useState, useRef } from 'react';
import { Button, TextField } from '@material-ui/core';
import { getMessageBody } from '../../shared/messages';
import LoadingContext from '../../contexts/loadingContext';

function AggregatorPage(props) {
  const { gapi, isSignedIn, billsInfo } = props;

  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');

  const [totalBill, setTotalBill] = useState(0);
  const [manualBills, setManualBills] = useState({});
  const billAmounts = useRef({});
  const loadingContext = useContext(LoadingContext);

  const getBillAmount = async (billInfo) => {
    const messageBody = await getMessageBody(gapi, billInfo);

    if (messageBody) {
      const amount = parseFloat(
        messageBody.match(/\$\s*\d*.\d{2}/)[0].slice(1)
      );

      billAmounts.current[billInfo.id] = amount;
    }
  };

  const handleGetTotalBill = async () => {
    loadingContext.setPending(true);

    const getAmountsPromise = Object.values(billsInfo).map((billInfo) =>
      getBillAmount(billInfo)
    );

    await Promise.all(getAmountsPromise);

    const totalBillAmount = Object.values(billAmounts.current).reduce(
      (acc, amount) => acc + amount,
      0
    );

    setTotalBill(totalBillAmount);
    loadingContext.setPending(false);
  };

  const handleManualInputSubmit = () => {
    const manualAmounts = {
      ...manualBills,
      [billName]: billAmount,
    };

    setManualBills(manualAmounts);
  };

  return (
    <>
      <h1>Bill Aggregator</h1>
      <div className="homePage">
        {isSignedIn && (
          <>
            <Button
              variant="contained"
              onClick={handleGetTotalBill}
              color="secondary"
            >
              Get Total
            </Button>
            <div className="manualInput">
              <div className="inputContainer">
                <span>Bill Name: </span>
                <TextField
                  id="manualBillName"
                  onChange={(event) => {
                    setBillName(event.target.value);
                  }}
                  value={billName}
                  type="text"
                />
                <span>Amount: </span>
                <TextField
                  id="manualBillAmount"
                  onChange={(event) => {
                    setBillAmount(parseFloat(event.target.value));
                  }}
                  value={billAmount}
                  type="number"
                />
              </div>
              <div className="manualInputBtnContainer">
                <Button
                  variant="contained"
                  onClick={handleManualInputSubmit}
                  color="primary"
                >
                  Submit
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setTotalBill(0);

                    billAmounts.current = {};
                  }}
                  color="primary"
                >
                  Clear
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      {!loadingContext.pending &&
        Object.values(billAmounts.current).length > 0 && (
          <div className="billsInfo">
            {Object.values(billsInfo).map((billInfo) => {
              const amount = billAmounts.current[billInfo.id];

              return (
                <div className="billInfoContainer" key={billInfo.id}>
                  <span className="billInfoName">{billInfo.name}: </span>
                  <span>${amount}</span>
                </div>
              );
            })}
            <div className="billsInfoContainer">
              <span className="billsInfoName">Total: </span>
              <span>{totalBill ? `$${totalBill}` : 'No bills'}</span>
            </div>
          </div>
        )}
    </>
  );
}

export default AggregatorPage;

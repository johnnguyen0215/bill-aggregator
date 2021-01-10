import { useContext, useState, useRef } from 'react';
import { Button, TextField } from '@material-ui/core';
import { getMessageBody } from '../../shared/messages';
import LoadingContext from '../../contexts/loadingContext';

function AggregatorPage(props) {
  const { gapi, isSignedIn, billsInfo } = props;

  const [totalBill, setTotalBill] = useState(0);
  const [manualBills, setManualBills] = useState({});
  const [manualAmount, setManualAmount] = useState(0);
  const [manualInputValue, setManualInputValue] = useState();
  const billAmounts = useRef({});
  const loadingContext = useContext(LoadingContext);

  const handleInputOnChange = async (event) => {
    setManualInputValue(event.target.value);
  };

  const getBillAmount = async (billInfo) => {
    const messageBody = await getMessageBody(gapi, billInfo);

    if (messageBody) {
      const billAmount = parseFloat(
        messageBody.match(/\$\s*\d*.\d{2}/)[0].slice(1)
      );

      billAmounts.current[billInfo.id] = billAmount;
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
                <span>Bill Name: $</span>
                <TextField
                  id="manualInputField"
                  onChange={handleInputOnChange}
                  onKeyDown={handleInputKeydown}
                  value={manualInputValue}
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
              const billAmount = billAmounts.current[billInfo.id];

              return (
                <div className="billInfoContainer" key={billInfo.id}>
                  <span className="billInfoName">{billInfo.name}: </span>
                  <span>${billAmount}</span>
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

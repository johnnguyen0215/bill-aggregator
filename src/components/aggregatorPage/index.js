import { useContext, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { getMessageBody } from '../../shared/messages';
import LoadingContext from '../../contexts/loadingContext';

function AggregatorPage(props) {
  const { gapi, isSignedIn, billsInfo } = props;

  const [totalBill, setTotalBill] = useState(0);
  const [manualInputValue, setManualInputValue] = useState();
  const [billAmounts, setBillAmounts] = useState([]);
  const loadingContext = useContext(LoadingContext);

  const handleInputOnChange = async (event) => {
    setManualInputValue(event.target.value);
  };

  const handleInputKeydown = async (event) => {
    if (event.key === 'Enter') {
      setTotalBill(parseFloat(totalBill) + parseFloat(manualInputValue));
    }
  };

  const handleGetTotalBill = async () => {
    loadingContext.setPending(true);

    let totalBillAmount = 0;

    const bills = [];

    const values = Object.values(billsInfo);

    const getTotalPromise = Object.values(billsInfo).map(
      (billInfo) => new Promise((resolve, reject) => {})
    );

    for (let i = 0; i < values.length; i++) {
      const billInfo = values[i];

      const messageBody = await getMessageBody(gapi, billInfo);

      if (messageBody) {
        const billAmount = parseFloat(
          messageBody.match(/\$\s*\d*.\d{2}/)[0].slice(1)
        );

        bills.push({
          id: billInfo.id,
          amount: billAmount,
        });

        totalBillAmount += billAmount;
      }
    }

    setBillAmounts(billAmounts);
    loadingContext.setPending(false);
    setTotalBill(totalBill + totalBillAmount);
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
                <Button
                  variant="contained"
                  onClick={() =>
                    setTotalBill(
                      parseFloat(manualInputValue) + parseFloat(totalBill)
                    )
                  }
                  color="primary"
                >
                  Submit
                </Button>
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
        )}
      </div>
      {!loadingContext.pending && billAmounts && billAmounts.length > 0 && (
        <div className="billsInfo">
          {billAmounts &&
            billAmounts.map((billAmount) => {
              const billInfo = billsInfo[billAmount.id];

              return (
                <div className="billInfoContainer">
                  <label className="billInfoName">{billInfo.name}: </label>
                  <span>${billAmount.amount}</span>
                </div>
              );
            })}
          <div className="billsInfoContainer">
            <label className="billsInfoName">Total: </label>
            <span>{totalBill ? `$${totalBill}` : 'No bills'}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default AggregatorPage;

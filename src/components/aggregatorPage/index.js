import { useContext, useState } from 'react';
import { Button, Paper, TextField, Fab } from '@material-ui/core';
import { snakeCase } from 'snake-case';
import BackspaceIcon from '@material-ui/icons/Backspace';
import { getMessageBody } from '../../shared/messages';
import LoadingContext from '../../contexts/loadingContext';
import './style.css';
import BillsContext from '../../contexts/billsContext';

function AggregatorPage(props) {
  const { gapi, isSignedIn } = props;

  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [splitValue, setSplitValue] = useState('');

  const loadingContext = useContext(LoadingContext);
  const billsContext = useContext(BillsContext);

  const { billsInfo } = billsContext;

  const getBillAmount = async (billInfo) => {
    const messageBody = await getMessageBody(gapi, billInfo);

    if (messageBody) {
      const amount = parseFloat(
        messageBody.match(/\$\s*\d*.\d{2}/)[0].slice(1)
      );

      billsInfo[billInfo.id].amount = amount;
    }
  };

  const getBillTotal = (bills) =>
    Object.values(bills).reduce((acc, billInfo) => {
      if (billInfo.amount !== undefined) {
        return acc + billInfo.amount;
      }

      return acc;
    }, 0);

  const handleGetTotalBill = async () => {
    loadingContext.setPending(true);

    const getAmountsPromise = Object.values(billsInfo)
      .filter((billInfo) => billInfo.type === 'email')
      .map((billInfo) => getBillAmount(billInfo));

    await Promise.all(getAmountsPromise);

    billsContext.setTotal(getBillTotal(billsInfo));

    loadingContext.setPending(false);
  };

  const handleManualInputSubmit = () => {
    const billId = snakeCase(billName);

    const updatedBillsInfo = {
      ...billsInfo,
      [billId]: {
        id: billId,
        name: billName,
        amount: billAmount,
      },
    };

    const billTotal = getBillTotal(updatedBillsInfo);

    billsContext.setBillsInfo(updatedBillsInfo);
    billsContext.setTotal(billTotal);

    setBillAmount('');
    setBillName('');
  };

  const removeBill = (billId) => {
    const updatedBills = {};

    const filteredKeys = Object.keys(billsInfo).filter(
      (billKey) => billKey !== billId
    );

    filteredKeys.forEach((key) => {
      updatedBills[key] = billsInfo[key];
    });

    return updatedBills;
  };

  return (
    <div className="aggregatorPage">
      <h1>Bill Aggregator</h1>
      <div>
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
                <span className="manualInputLabel">Bill Name: </span>
                <TextField
                  className="manualInputField"
                  id="manualBillName"
                  onChange={(event) => {
                    setBillName(event.target.value);
                  }}
                  value={billName}
                  type="text"
                />
                <span className="manualInputLabel">Amount: $</span>
                <TextField
                  className="manualInputField"
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
                  disabled={!billName || !billAmount}
                >
                  Add Bill
                </Button>
              </div>
            </div>
          </>
        )}
        {!loadingContext.pending && billsContext.total !== null && (
          <>
            <ul className="billList">
              {Object.values(billsInfo)
                .filter((billInfo) => billInfo.amount !== undefined)
                .map((billInfo) => (
                  <li className="billItem" key={billInfo.id}>
                    <Paper className="billInfoContainer" square>
                      <span className="billInfoName">{billInfo.name}: </span>
                      <span>${billInfo.amount.toFixed(2)}</span>
                      <Fab
                        className="removeButton"
                        size="small"
                        color="secondary"
                        onClick={() => {
                          let updatedBills = {};

                          if (billInfo.type !== 'email') {
                            updatedBills = removeBill(billInfo.id);
                          } else {
                            updatedBills = {
                              ...billsInfo,
                              [billInfo.id]: {
                                ...billsInfo[billInfo.id],
                                amount: undefined,
                              },
                            };
                          }

                          const billTotal = getBillTotal(updatedBills);

                          billsContext.setBillsInfo(updatedBills);
                          billsContext.setTotal(billTotal);
                        }}
                      >
                        <BackspaceIcon fontSize="small" />
                      </Fab>
                    </Paper>
                  </li>
                ))}
            </ul>
            <div className="billsInfoContainer">
              {billsContext.total > 0 && (
                <div>
                  <h2>Total: ${billsContext.total.toFixed(2)}</h2>
                </div>
              )}
              {billsContext.total > 0 && (
                <div className="inputContainer">
                  <span className="manualInputLabel">Split By: </span>
                  <TextField
                    id="splitByField"
                    type="number"
                    value={splitValue}
                    onChange={(event) => {
                      if (event.target.value) {
                        setSplitValue(parseInt(event.target.value, 10));
                      } else {
                        setSplitValue('');
                      }
                    }}
                  />
                </div>
              )}
              {splitValue && splitValue > 0 && billsContext.total > 0 && (
                <div>
                  <h2>
                    Split Total: ${(billsContext.total / splitValue).toFixed(2)}
                  </h2>
                </div>
              )}
            </div>
          </>
        )}
        {!loadingContext.pending && billsContext.total > 0 && (
          <Button
            className="clearButton"
            variant="contained"
            onClick={() => {
              const filteredKeys = Object.keys(billsInfo).filter(
                (key) => billsInfo[key].type === 'email'
              );

              const updatedBills = {};

              filteredKeys.forEach((key) => {
                updatedBills[key] = {
                  ...billsInfo[key],
                  amount: undefined,
                };
              });

              billsContext.setBillsInfo(updatedBills);
              billsContext.setTotal(null);
            }}
            color="primary"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

export default AggregatorPage;

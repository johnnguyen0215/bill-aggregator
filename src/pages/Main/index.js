import {
  TableContainer,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Table,
  TableHead,
  Button,
  Select,
  MenuItem,
  Fab,
  Typography,
  Grid,
  TextField,
  Modal,
  Box,
} from '@mui/material';
import { Article, Delete, Edit } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { blue, green, red } from '@mui/material/colors';
import { format } from 'date-fns';
import { getDollarAmount, getMessage } from '../../shared/messages';
import { useAuth } from '../../providers/auth';
import { DetailsDrawer } from '../../components/DetailsDrawer';
import { useLoading } from '../../providers/loading';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const monthYears = MONTHS.map((month, index) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return {
    month: index,
    year: index > currentMonth ? currentYear - 1 : currentYear,
  };
});

const filterMessageBody = (billData) =>
  billData.map((bill) => {
    const { messageBody, ...billDetails } = bill;

    return billDetails;
  });

export const Main = () => {
  const billDataRaw = localStorage.getItem('bill_aggregator_data');

  const [billData, setBillData] = useState(
    billDataRaw ? JSON.parse(billDataRaw) : []
  );

  const [currentBillHtml, setCurrentBillHtml] = useState();

  const [billModalOpen, setBillModalOpen] = useState(false);

  const handleBillModalClose = () => {
    setBillModalOpen(false);
  };

  const [selectIndex, setSelectIndex] = useState(0);
  const [selectedMonthYear, setSelectedMonthYear] = useState(monthYears[0]);

  const [divisor, setDivisor] = useState(1);

  const { setIsLoading } = useLoading();
  const { signout } = useAuth();

  const [isBillDrawerOpen, setIsBillDrawerOpen] = useState(false);
  const [billDetailFields, setBillDetailFields] = useState({});

  const [billHtmlList, setBillHtmlList] = useState([]);

  const [billTotal, setBillTotal] = useState(0);

  const [adjustment, setAdjustment] = useState(0);

  const failureCallback = useCallback(() => {
    signout();
  }, [signout]);

  const fetchAllMessages = async () => {
    const billsWithEmails = billData.filter(
      (billInfo) => billInfo.type === 'email'
    );

    setIsLoading(true);

    const messages = await Promise.all(
      billsWithEmails.map(async (billInfo) =>
        getMessage(billInfo, failureCallback, selectedMonthYear)
      )
    );

    const htmlList = [];

    const hydratedBills = billData.map((bill) => {
      if (bill.type === 'email') {
        const billMessage = messages.find((message) => message.id === bill.id);

        let messageDate = '';

        if (billMessage?.date) {
          messageDate = format(new Date(billMessage?.date), 'MMM dd yyyy');
        }

        htmlList.push(billMessage?.body);

        const dollarAmount = getDollarAmount(billMessage?.body);

        const amount = parseFloat(dollarAmount || 0);
        const modifier = parseFloat(bill.modifier || 0);

        let finalAmount = amount;

        if (dollarAmount) {
          finalAmount = amount + modifier;
        }

        return {
          ...bill,
          messageBody: billMessage?.body,
          modifier,
          amount,
          finalAmount,
          date: messageDate,
        };
      }

      htmlList.push('');

      return bill;
    });

    setBillHtmlList(htmlList);

    setBillData(hydratedBills);

    setIsLoading(false);
  };

  const handleAddBill = () => {
    setIsBillDrawerOpen(true);
  };

  const handleGetBills = async () => {
    await fetchAllMessages();
  };

  const handleMonthSelect = (event) => {
    const index = event.target.value;
    setSelectIndex(index);
    setSelectedMonthYear(monthYears[index]);
  };

  const handleBillDrawerClose = () => {
    setBillDetailFields({});
    setIsBillDrawerOpen(false);
  };

  const handleDivisorChange = (event) => {
    setDivisor(event.target.value);
  };

  const handleViewBill = (index) => {
    setCurrentBillHtml(billHtmlList[index]);
    setBillModalOpen(true);
  };

  const handleSaveBill = (billDetails) => {
    const { index, ...billInfo } = billDetails;

    billInfo.finalAmount = parseFloat(billInfo.amount);

    if (billInfo.modifier) {
      billInfo.finalAmount += parseFloat(billInfo.modifier || 0);
    }

    const updatedBillData = [...billData];

    if (index !== undefined) {
      updatedBillData[index] = billInfo;
    } else {
      updatedBillData.push(billInfo);
    }

    setIsBillDrawerOpen(false);
    setBillDetailFields({});
    setBillData(updatedBillData);
  };

  const handleRemoveBill = (billId) => {
    const updatedBillData = [...billData];

    const billIndex = billData.findIndex((bill) => bill.id === billId);

    updatedBillData.splice(billIndex, 1);

    setBillData(updatedBillData);
  };

  const handleEditBill = (index) => {
    const billDetails = billData[index];

    setBillDetailFields({
      ...billDetails,
      index,
    });

    setIsBillDrawerOpen(true);
  };

  const handleAdjustmentChange = (evt) => {
    setAdjustment(evt.target.value);
  };

  useEffect(() => {
    if (billData) {
      localStorage.setItem(
        'bill_aggregator_data',
        JSON.stringify(filterMessageBody(billData))
      );

      const total = billData.reduce(
        (acc, billInfo) =>
          acc +
          (billInfo.finalAmount !== undefined
            ? parseFloat(billInfo.finalAmount)
            : parseFloat(billInfo.amount)),
        0
      );

      setBillTotal(total);
    }
  }, [billData]);

  useEffect(() => {
    const currentDate = new Date();
    const previousMonthIndex = currentDate.getMonth() - 1;

    const previousMonth =
      previousMonthIndex < 0 ? MONTHS.length - 1 : previousMonthIndex;

    setSelectIndex(previousMonth);
    setSelectedMonthYear(monthYears[previousMonth]);
  }, []);

  return (
    <div>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{
          marginTop: '86px',
          marginBottom: '20px',
        }}
      >
        <Grid container item xs={6} spacing={2} alignItems="center">
          <Grid item>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectIndex}
              label="Age"
              onChange={handleMonthSelect}
            >
              {monthYears?.map(({ month, year }, index) => (
                <MenuItem value={index}>
                  {MONTHS[month]} {year}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={handleGetBills}>
              Get Bills
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={handleAddBill}>
            Add Bill
          </Button>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>View Bill</TableCell>
            <TableCell>Edit</TableCell>
            <TableCell>Remove</TableCell>
          </TableHead>
          <TableBody>
            {billData.map((bill, index) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.name}</TableCell>
                <TableCell>{bill.email}</TableCell>
                <TableCell>{bill.subject}</TableCell>
                <TableCell>
                  {bill.finalAmount !== undefined
                    ? `$${bill.finalAmount.toFixed(2)}`
                    : `$${bill.amount}`}
                </TableCell>
                <TableCell>{bill.date ? bill.date : 'Empty'}</TableCell>
                <TableCell>
                  {billHtmlList[index] && (
                    <Fab
                      size="small"
                      sx={{
                        color: '#FFF',
                        bgcolor: green[500],
                        '&:hover': {
                          bgcolor: green[600],
                        },
                      }}
                      onClick={() => handleViewBill(index)}
                    >
                      <Article fontSize="small" />
                    </Fab>
                  )}
                </TableCell>
                <TableCell>
                  <Fab
                    size="small"
                    sx={{
                      color: '#FFF',
                      bgcolor: blue[500],
                      '&:hover': {
                        bgcolor: blue[600],
                      },
                    }}
                    onClick={() => handleEditBill(index)}
                  >
                    <Edit fontSize="small" />
                  </Fab>
                </TableCell>
                <TableCell>
                  <Fab
                    size="small"
                    sx={{
                      color: '#FFF',
                      bgcolor: red[500],
                      '&:hover': {
                        bgcolor: red[600],
                      },
                    }}
                    onClick={() => handleRemoveBill(bill.id)}
                  >
                    <Delete fontSize="small" />
                  </Fab>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper
        sx={{
          marginTop: '20px',
          padding: '16px',
        }}
      >
        <Typography variant="h5">Total: ${billTotal.toFixed(2)}</Typography>
        <TextField
          sx={{
            marginTop: '20px',
          }}
          type="number"
          label="Divisor"
          value={divisor}
          onChange={handleDivisorChange}
        />
        <TextField
          sx={{
            marginLeft: '20px',
            marginTop: '20px',
          }}
          type="number"
          label="Adjustment"
          value={adjustment}
          onChange={handleAdjustmentChange}
        />
        <Typography variant="h5" sx={{ marginTop: '20px' }}>
          Monthly Split: $
          {(billTotal / divisor + parseFloat(adjustment || 0)).toFixed(2)}
        </Typography>
      </Paper>
      <Modal open={billModalOpen} onClose={handleBillModalClose}>
        <Paper
          sx={{
            position: 'absolute',
            padding: '20px',
            height: '600px',
            width: '800px',
            top: '50%',
            left: '50%',
            overflow: 'scroll',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box>
            <div dangerouslySetInnerHTML={{ __html: currentBillHtml }} />
          </Box>
        </Paper>
      </Modal>
      <DetailsDrawer
        isOpen={isBillDrawerOpen}
        handleClose={handleBillDrawerClose}
        handleSave={handleSaveBill}
        billDetailFields={billDetailFields}
      />
    </div>
  );
};

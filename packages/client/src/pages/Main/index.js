import {
  TableContainer,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Fab,
  Table,
  TableHead,
  Button,
  Select,
  MenuItem,
  Drawer,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Save } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { getDollarAmount, getMessageBody } from '../../shared/messages';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';
import { useAuth } from '../../providers/auth';
import styles from './styles.module.css';
import { green } from '@mui/material/colors';

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

const BILLS_MOCK = [
  {
    name: 'Socal Gas',
    id: 'socal_gas',
    email: 'customerservice@socalgas.com',
    subject: 'Your Bill from SoCalGas is now available',
    type: 'email',
  },
  {
    name: 'Socal Edison',
    id: 'socal_edison',
    email: 'sce@entnotification.sce.com',
    subject: 'Bill is Ready',
    type: 'email',
  },
  {
    name: 'State Farm',
    id: 'state_farm',
    email: 'statefarminfo@statefarminfo.com',
    subject: 'Your State Farm bill is ready',
    type: 'email',
  },
  {
    name: 'Garden Grove Water',
    id: 'garden_grove_water',
    email: 'finance-billing@ggcity.org',
    subject: 'City of Garden Grove: Water Bill',
    type: 'email',
  },
];

export const Main = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { setIsSignedIn } = useAuth();
  const [billData, setBillData] = useState(BILLS_MOCK);
  const [month, setMonth] = useState(1);
  const [isBillDrawerOpen, setIsBillDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const failureCallback = useCallback(() => {
    localStorage.removeItem('aggregator_token');
    setIsSignedIn(false);
    navigate(routes.signin);
  }, [setIsSignedIn, navigate]);

  const handleAddBill = () => {
    setIsBillDrawerOpen(true);
  };

  const handleGetBills = async () => {
    await Promise.all(() => {
      BILLS_MOCK.map(async (billInfo) => {
        return await getMessageBody(billInfo, failureCallback);
      });
    });
  };

  const handleMonthSelect = (event) => {
    setMonth(event.target.value);
  };

  const handleBillDrawerClose = () => {
    setIsBillDrawerOpen(false);
  };

  const handleSaveBill = () => {};

  return (
    <div>
      {/* <Fab color="secondary" onClick={handleAddBill}>
        <Add />
      </Fab> */}
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={month}
        label="Age"
        onChange={handleMonthSelect}
      >
        {MONTHS.map((month, index) => {
          return <MenuItem value={index + 1}>{month}</MenuItem>;
        })}
      </Select>
      <Button variant="contained" onClick={handleGetBills}>
        Get Bills
      </Button>
      <Button variant="contained" onClick={handleAddBill}>
        Add Bill
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>View Bill</TableCell>
            <TableCell>Edit</TableCell>
          </TableHead>
          <TableBody>
            {billData.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.name}</TableCell>
                <TableCell>{bill.email}</TableCell>
                <TableCell>{bill.subject}</TableCell>
                <TableCell>{bill.amount}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Drawer
        anchor="right"
        open={isBillDrawerOpen}
        onClose={handleBillDrawerClose}
      >
        <div class={styles.formContainer}>
          <Typography variant="h4" gutterBottom align="center">
            Bill Details
          </Typography>
          <div class={styles.textFieldContainer}>
            <TextField required label="Name" />
          </div>
          <div class={styles.textFieldContainer}>
            <TextField required label="Email" />
          </div>
          <div class={`${styles.textFieldContainer}`}>
            <TextField required label="Subject" fullWidth={500} />
          </div>
          <div class={styles.textFieldContainer}>
            <TextField label="Amount" />
          </div>
        </div>
        <div class={styles.saveContainer}>
          <Fab
            sx={{
              color: '#FFF',
              bgcolor: green[300],
              bottom: 16,
              right: 16,
              position: 'absolute',
            }}
            onClick={handleSaveBill}
          >
            <Save />
          </Fab>
        </div>
      </Drawer>
    </div>
  );
};

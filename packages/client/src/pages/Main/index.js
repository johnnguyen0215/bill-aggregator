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
} from '@mui/material';
import { Add, Article, Delete, Edit, Save } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { getDollarAmount, getMessageBody } from '../../shared/messages';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';
import { useAuth } from '../../providers/auth';
import { DetailsDrawer } from '../../components/DetailsDrawer';
import { snakeCase } from 'snake-case';
import { blue, green, red } from '@mui/material/colors';

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
  const billDataRaw = localStorage.getItem('bill_aggregator_data');

  const [billData, setBillData] = useState(
    billDataRaw ? JSON.parse(billDataRaw) : []
  );
  const [month, setMonth] = useState(1);
  const [isBillDrawerOpen, setIsBillDrawerOpen] = useState(false);
  const [billDetailFields, setBillDetailFields] = useState({});

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
      billData.map(async (billInfo) => {
        return await getMessageBody(billInfo, failureCallback);
      });
    });
  };

  const handleMonthSelect = (event) => {
    setMonth(event.target.value);
  };

  const handleBillDrawerClose = () => {
    setBillDetailFields({});
    setIsBillDrawerOpen(false);
  };

  const handleSaveBill = (billDetails) => {
    const billIndex = billData.findIndex((bill) => {
      return bill.id === billDetails.id;
    });

    const updatedBillData = [...billData];

    if (billIndex !== -1) {
      updatedBillData[billIndex] = billDetails;
    } else {
      updatedBillData.push(billDetails);
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

  const handleEditBill = (billId) => {
    const billDetails = billData.find((bill) => bill.id === billId);

    setBillDetailFields(billDetails);

    setIsBillDrawerOpen(true);
  };

  useEffect(() => {
    if (billData) {
      localStorage.setItem('bill_aggregator_data', JSON.stringify(billData));
    }
  }, [billData]);

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
            <TableCell>Remove</TableCell>
          </TableHead>
          <TableBody>
            {billData.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.name}</TableCell>
                <TableCell>{bill.email}</TableCell>
                <TableCell>{bill.subject}</TableCell>
                <TableCell>${bill.amount}</TableCell>
                <TableCell>
                  <Fab
                    size="small"
                    sx={{
                      color: '#FFF',
                      bgcolor: green[500],
                      '&:hover': {
                        bgcolor: green[600],
                      },
                    }}
                  >
                    <Article fontSize="small" />
                  </Fab>
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
                    onClick={() => handleEditBill(bill.id)}
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
      <DetailsDrawer
        isOpen={isBillDrawerOpen}
        handleClose={handleBillDrawerClose}
        handleSave={handleSaveBill}
        billDetailFields={billDetailFields}
      />
    </div>
  );
};

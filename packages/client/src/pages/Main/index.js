import {
  TableContainer,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Fab,
  Table,
  TableHead,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { getMessageBody } from '../../shared/messages';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';
import { useAuth } from '../../providers/auth';

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
    email: 'ibp3@scewebservices.com',
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

  const navigate = useNavigate();

  const failureCallback = useCallback(() => {
    localStorage.removeItem('aggregator_token');
    setIsSignedIn(false);
    navigate(routes.signin);
  }, [setIsSignedIn, navigate]);

  useEffect(() => {
    const elecBill = BILLS_MOCK[1];
    getMessageBody(elecBill, failureCallback);
  }, [failureCallback]);

  const handleAddBill = () => {};

  return (
    <div>
      <Fab color="secondary" onClick={handleAddBill}>
        <Add />
      </Fab>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Amount</TableCell>
          </TableHead>
          <TableBody>
            {billData.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.name}</TableCell>
                <TableCell>{bill.email}</TableCell>
                <TableCell>{bill.subject}</TableCell>
                <TableCell>{bill.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

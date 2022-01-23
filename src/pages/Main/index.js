import {
  TableContainer,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from '@mui/material';

export const Main = () => {
  console.log('hello');

  return (
    <TableContainer component={Paper}>
      <TableBody>
        <TableRow>
          <TableCell />
          <TableCell />
          <TableCell />
        </TableRow>
      </TableBody>
    </TableContainer>
  );
};

import { useContext } from 'react';
import BillsContext from '../../contexts/billsContext';
import BillCard from '../billCard';
import './style.css';

function BillManager() {
  const billsContext = useContext(BillsContext);

  const { billsInfo } = billsContext;

  console.log(billsInfo);

  return (
    <div className="billManager">
      <h1>Bill Manager</h1>
      <ul className="billList">
        {Object.values(billsInfo).map((billInfo) => (
          <BillCard key={billInfo.id} billInfo={billInfo} />
        ))}
      </ul>
    </div>
  );
}

export default BillManager;

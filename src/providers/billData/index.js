import { createContext, useContext, useState } from 'react';

// const [billsInfo, setBillsInfo] = useState({
//   socal_gas: {
//     name: 'Socal Gas',
//     id: 'socal_gas',
//     email: 'customerservice@socalgas.com',
//     subject: 'Your Bill from Southern California Gas Company',
//     type: 'email',
//   },
//   socal_edison: {
//     name: 'Socal Edison',
//     id: 'socal_edison',
//     email: 'ibp3@scewebservices.com',
//     subject: 'SCE Bill is Ready to View',
//     type: 'email',
//   },
//   geico: {
//     name: 'Geico',
//     id: 'geico',
//     email: 'geico@email1.geico.com',
//     subject: 'consider reviewing this pending GEICO payment',
//     type: 'email',
//   },
// });

const BillDataContext = createContext({});

export const BillDataProvider = ({ children }) => {
  const [billData, setBillData] = useState();

  return (
    <BillDataContext.Provider
      value={{
        billData,
        setBillData,
      }}
    >
      {children}
    </BillDataContext.Provider>
  );
};

export const useData = () => useContext(BillDataContext);

import { createContext, useContext, useMemo, useState } from 'react';

const BillDataContext = createContext({});

export const BillDataProvider = ({ children }) => {
  const [billData, setBillData] = useState();

  const contextValues = useMemo(
    () => ({ billData, setBillData }),
    [billData, setBillData]
  );

  return (
    <BillDataContext.Provider value={contextValues}>
      {children}
    </BillDataContext.Provider>
  );
};

export const useData = () => useContext(BillDataContext);

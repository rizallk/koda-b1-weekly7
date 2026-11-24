import { useState } from 'react';
import { AppContext } from './AppContext';

export function AppProvider({ children }) {
  const [topUpConfirmData, setTopUpConfirmData] = useState({});
  const [transferAmount, setTransferAmount] = useState(0);

  return (
    <AppContext.Provider
      value={{
        topUpConfirmData,
        setTopUpConfirmData,
        transferAmount,
        setTransferAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

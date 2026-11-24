import { useCallback, useState } from 'react';
import { transferApi } from '../services/transferService';

export const useTransfer = () => {
  const [isLoading, setIsLoading] = useState(false);

  const transfer = useCallback(
    async ({ senderWalletId, receiverWalletId, amount, description }) => {
      try {
        setIsLoading(true);

        const res = await transferApi(
          senderWalletId,
          receiverWalletId,
          amount,
          description,
        );

        return res;
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    transfer,
    isLoading,
  };
};

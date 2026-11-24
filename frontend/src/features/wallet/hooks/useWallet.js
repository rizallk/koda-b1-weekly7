import { useCallback, useState } from 'react';
import {
  confirmTopUpApi,
  createTopUpRequestApi,
  getLookupRecipientWalletApi,
  getMyWalletApi,
} from '../services/walletRequestService';

export const useWallet = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getMyWallet = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await getMyWalletApi();

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLookupRecipientWallet = useCallback(
    async ({ walletNumber = '' }) => {
      try {
        setIsLoading(true);

        const res = await getLookupRecipientWalletApi(walletNumber);

        return res;
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createTopUpRequest = useCallback(
    async ({ paymentMethodId = '', amount = '' }) => {
      try {
        setIsLoading(true);

        const res = await createTopUpRequestApi(paymentMethodId, amount);

        return res;
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const confirmTopUp = useCallback(async (topUpRequestId) => {
    try {
      setIsLoading(true);

      const res = await confirmTopUpApi(topUpRequestId);

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getMyWallet,
    getLookupRecipientWallet,
    createTopUpRequest,
    confirmTopUp,
    isLoading,
  };
};

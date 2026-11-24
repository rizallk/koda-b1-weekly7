import { useCallback, useState } from 'react';
import { getAllPaymentMethodApi } from '../services/paymentMethodService';

export const usePaymentMethod = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getAllPaymentMethod = useCallback(async ({ isActive = '' } = '') => {
    try {
      setIsLoading(true);

      const res = await getAllPaymentMethodApi(isActive);

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAllPaymentMethod,
    isLoading,
  };
};

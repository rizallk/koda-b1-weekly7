import { useCallback, useState } from 'react';
import { getAllTopUpRequestsApi } from '../services/topUpRequestService';

export const useTopUpRequest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getAllTopUpRequests = useCallback(async ({ isActive }) => {
    try {
      setIsLoading(true);

      const res = await getAllTopUpRequestsApi(isActive);

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAllTopUpRequests,
    isLoading,
  };
};

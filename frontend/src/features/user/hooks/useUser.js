import { useCallback, useState } from 'react';
import {
  getAllUsersApi,
  getUserByIdApi,
  getUserMutationsApi,
  getUserProfileApi,
  getUserTransactionsApi,
  updateUserProfileApi,
} from '../services/userService';

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await getUserProfileApi();

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (payload) => {
    try {
      setIsLoading(true);

      const res = await updateUserProfileApi(payload);

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserTransactions = useCallback(
    async ({
      page = 1,
      pageSize = 10,
      search = '',
      type = '',
      status = '',
      startDate = '',
      endDate = '',
      sortBy = '',
      orderBy = '',
    } = {}) => {
      try {
        setIsLoading(true);

        const res = await getUserTransactionsApi(
          page,
          pageSize,
          search,
          type,
          status,
          startDate,
          endDate,
          sortBy,
          orderBy,
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

  const getUserMutations = useCallback(
    async ({
      page = 1,
      pageSize = 10,
      search = '',
      type = '',
      status = '',
      startDate = '',
      endDate = '',
      sortBy = '',
      orderBy = '',
    } = {}) => {
      try {
        setIsLoading(true);

        const res = await getUserMutationsApi(
          page,
          pageSize,
          search,
          type,
          status,
          startDate,
          endDate,
          sortBy,
          orderBy,
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

  const getAllUsers = useCallback(
    async ({ search, status, role, page, pageSize } = {}) => {
      try {
        setIsLoading(true);

        const res = await getAllUsersApi(search, status, role, page, pageSize);

        return res;
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getUserById = useCallback(async (id) => {
    try {
      setIsLoading(true);

      const res = await getUserByIdApi(id);

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatusById = useCallback(async (id, status, reason) => {
    try {
      setIsLoading(true);

      const res = await getUserByIdApi(id, status, reason);

      return res;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getUserProfile,
    updateUserProfile,
    getUserTransactions,
    getUserMutations,
    getAllUsers,
    getUserById,
    updateUserStatusById,
    isLoading,
  };
};

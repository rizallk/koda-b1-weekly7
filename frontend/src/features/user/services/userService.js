import { api } from '@/lib/apiClient';

export const getUserProfileApi = async () => {
  return await api.get('/users/profile');
};

export const updateUserProfileApi = async (payload) => {
  return await api.put('/users/profile', payload, {
    showSuccess: true,
  });
};

export const getUserTransactionsApi = async (
  page,
  pageSize,
  search,
  type,
  status,
  startDate,
  endDate,
  sortBy,
  orderBy,
) => {
  return await api.get(
    `/users/me/transactions?page=${page}&pageSize=${pageSize}&search=${search}&type=${type}&status=${status}&startDate=${startDate}&endDate=${endDate}&sortBy=${sortBy}&orderBy=${orderBy}`,
  );
};

export const getUserMutationsApi = async (
  page,
  pageSize,
  search,
  type,
  status,
  startDate,
  endDate,
  sortBy,
  orderBy,
) => {
  return await api.get(
    `/users/me/mutations?page=${page}&pageSize=${pageSize}&search=${search}&type=${type}&status=${status}&startDate=${startDate}&endDate=${endDate}&sortBy=${sortBy}&orderBy=${orderBy}`,
  );
};

export const getAllUsersApi = async (search, status, role, page, pageSize) => {
  return await api.get(
    `/users?page=${page}&pageSize=${pageSize}&search=${search}&status=${status}&role=${role}`,
  );
};

export const getUserByIdApi = async (id) => {
  return await api.get(`/users/${id}`);
};

export const updateUserStatusByIdApi = async (id, status, reason) => {
  return await api.patch(
    `/users/${id}/status`,
    { status, reason },
    { showSuccess: true },
  );
};

export const getUserSummaryApi = async () => {
  return await api.get(`/users/summary`);
};

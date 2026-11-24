import { api } from '@/lib/apiClient';

export const getAllTopUpRequestsApi = async () => {
  return await api.get(`/topup-requests`);
};

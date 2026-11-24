import { api } from '@/lib/apiClient';

export const getAllPaymentMethodApi = async (isActive) => {
  return await api.get(`/payment-methods?isActive=${isActive}`);
};

import { api } from '@/lib/apiClient';

export const getMyWalletApi = async () => {
  return await api.get(`/wallets/me`);
};

export const getLookupRecipientWalletApi = async (walletNumber) => {
  return await api.get(`/wallets/lookup/${walletNumber}`);
};

export const createTopUpRequestApi = async (paymentMethodId, amount) => {
  return await api.post(
    '/wallets/me/topup',
    { paymentMethodId, amount },
    { showSuccess: true },
  );
};

export const confirmTopUpApi = async (topUpRequestId) => {
  return await api.post(`/wallets/topup/${topUpRequestId}/confirm`, null, {
    showSuccess: true,
  });
};

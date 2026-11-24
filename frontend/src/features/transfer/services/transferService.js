import { api } from '@/lib/apiClient';

export const transferApi = async (
  senderWalletId,
  receiverWalletId,
  amount,
  description,
) => {
  return await api.post(
    `/transfers`,
    {
      senderWalletId,
      receiverWalletId,
      amount,
      description,
    },
    {
      showSuccess: true,
    },
  );
};

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/customs/StatusBadge';
import { cn } from '@/lib/utils';
import { usePaymentMethod } from '@/features/paymentMethod/hooks/usePaymentMethod';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { topUpRequestValidation } from '@/features/wallet/validations/topUpRequestValidation';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { formatRupiah } from '@/utils/formatRupiah';

export default function TopUpRequest() {
  const navigate = useNavigate();
  const { getMyWallet, createTopUpRequest } = useWallet();
  const { getAllPaymentMethod } = usePaymentMethod();

  const [myWallet, setMyWallet] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState({
    id: -1,
    name: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValue: {
      amount: 0,
    },
    resolver: yupResolver(topUpRequestValidation),
  });

  const onSubmit = async ({ amount }) => {
    try {
      if (selectedMethod.id === -1)
        return setSelectedMethod({ id: 0, name: '' });

      const data = await createTopUpRequest({
        paymentMethodId: selectedMethod.id,
        amount,
      });

      navigate(selectedMethod.code === 'QRIS' ? 'qris' : 'confirm', {
        state: {
          paymentMethodId: selectedMethod.id,
          paymentMethodName: selectedMethod.name,
          amount: Number(amount),
          balance: myWallet?.balance || 0,
          topUpRequestId: data?.topUpRequestId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const data = await getAllPaymentMethod({ isActive: true });

        setPaymentMethods(data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchMyWallet = async () => {
      try {
        const data = await getMyWallet();

        setMyWallet(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPaymentMethod();
    fetchMyWallet();
  }, []);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-3xl bg-white p-8 lg:col-span-8"
      >
        <h2 className="text-xl font-bold text-[#111827]">
          Buat permintaan isi saldo
        </h2>
        <p className="mt-1 text-xs text-[#6B7280]">
          Saldo baru bertambah setelah pembayaran dikonfirmasi.
        </p>

        <div className="mt-7 space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#4B5563]">
              Nominal isi saldo
            </label>
            <Input
              type="number"
              placeholder="Rp 250.000"
              className="font-medium"
              required
              errorMsg={errors?.amount?.message}
              {...register('amount')}
            />
          </div>

          <div>
            <label className="mb-2.5 block text-xs font-semibold text-[#4B5563]">
              Metode pembayaran
            </label>
            {selectedMethod.id === 0 && (
              <label className="mb-2 mt-2 block text-xs font-semibold text-red-400">
                Metode pembayaran harus dipilih
              </label>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((item) => {
                  const isSelected = selectedMethod.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setSelectedMethod({
                          id: item.id,
                          name: item.name,
                          code: item.code,
                        })
                      }
                      className={cn(
                        'rounded-2xl border p-5 text-left transition-all',
                        isSelected
                          ? 'border-[#136C63] bg-[#EAF3F0]'
                          : 'border-transparent bg-white hover:bg-[#F6F9F8]',
                      )}
                    >
                      <p className="text-base font-bold text-[#111827]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {isSelected
                          ? 'Metode terpilih · simulasi'
                          : 'Pembayaran simulasi'}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-sm my-4 text-gray-600">
                  Loading...
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-8 w-full justify-start px-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Loading...' : 'Lanjutkan pembayaran'}
        </Button>
      </form>

      <div className="rounded-3xl bg-white p-7 lg:col-span-4">
        <h2 className="text-lg font-bold text-[#111827]">Ringkasan akun</h2>

        <div className="mt-6">
          <p className="text-xs text-[#6B7280]">Saldo saat ini</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-[#111827]">
            {formatRupiah(myWallet?.balance)}
          </p>
        </div>

        <div className="my-5 border-t border-[#EDF2F0]" />

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B7280]">Status dompet</span>
          <StatusBadge status={myWallet?.walletStatus} uppercase />
        </div>
      </div>
    </div>
  );
}

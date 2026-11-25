import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/customs/BrandLogo';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/utils/formatRupiah';
import { useTransfer } from '@/features/transfer/hooks/useTransfer';

export default function TransferConfirm() {
  const { transfer, isLoading } = useTransfer();
  const location = useLocation();
  const data = location.state;
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      const resData = await transfer({
        senderWalletId: data.senderWalletId,
        receiverWalletId: data.receiverWalletId,
        amount: data.amount,
        description: data.description,
      });

      navigate('/transfer/success', {
        state: {
          referenceNo: resData.referenceNo,
          balance: data.balance,
          amount: resData.amount,
          recipientName: data.recipientName,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (Object.keys(data).length === 0) return <Navigate to="/transfer" />;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="px-8 py-6 sm:px-12">
        <BrandLogo showIcon={false} to="/" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[540px]">
          <Link
            to="/transfer"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#136C63] hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke transfer</span>
          </Link>

          <div className="rounded-3xl bg-[#F7F9F8] p-8 sm:p-10">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              Konfirmasi transfer
            </h1>
            <p className="mt-1.5 text-xs text-[#6B7280]">
              Periksa kembali detail sebelum mengirim.
            </p>

            <div className="mt-8 space-y-5">
              <div className="grid grid-cols-2 items-center">
                <span className="text-xs text-[#6B7280]">Penerima</span>
                <span className="text-sm font-semibold text-[#111827]">
                  {data.recipientName}
                </span>
              </div>

              <div className="grid grid-cols-2 items-center">
                <span className="text-xs text-[#6B7280]">Nominal</span>
                <span className="text-base font-bold text-[#111827]">
                  {formatRupiah(data.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 items-center">
                <span className="text-xs text-[#6B7280]">Catatan</span>
                <span className="text-sm font-medium text-[#111827]">
                  {data.description || '-'}
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-[#E5ECE9]" />

            <div className="grid grid-cols-2 items-center">
              <span className="text-xs text-[#6B7280]">
                Sisa saldo setelah transfer
              </span>
              <span className="text-lg font-bold text-[#111827]">
                {formatRupiah(data.balance - data.amount)}
              </span>
            </div>

            <Button
              size="lg"
              onClick={handleConfirm}
              className="mt-8 w-full justify-start px-5"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Konfirmasi transfer'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

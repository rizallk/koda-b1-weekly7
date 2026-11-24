import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/customs/BrandLogo';
import { Button } from '@/components/ui/button';
import { DemoQrCode } from '@/utils/demoQrCode';
import { formatRupiah } from '@/utils/formatRupiah';
import { useWallet } from '@/features/wallet/hooks/useWallet';

export default function TopUpQris() {
  const location = useLocation();
  const topUpConfirmData = location.state;
  const { confirmTopUp, isLoading } = useWallet();
  const navigate = useNavigate();

  const handleSimulateQris = async () => {
    try {
      await confirmTopUp(topUpConfirmData?.topUpRequestId);

      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  if (Object.keys(topUpConfirmData).length === 0)
    return <Navigate to="/topup" />;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="px-8 py-6 sm:px-12">
        <BrandLogo showIcon={false} to="/" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[540px]">
          <Link
            to="/topup"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#136C63] hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Ubah metode pembayaran</span>
          </Link>

          <div className="rounded-3xl bg-[#F7F9F8] p-8 sm:p-10">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              Pembayaran QRIS
            </h1>
            <p className="mt-1.5 text-xs text-[#6B7280]">
              Pindai kode QR melalui aplikasi pembayaranmu.
            </p>

            {/* Kotak QR Demo */}
            <div className="mt-6 flex flex-col items-center">
              <div className="rounded-xl bg-white p-5 shadow-2xs">
                <DemoQrCode />
              </div>
              <p className="mt-3 text-[11px] text-[#6B7280]">
                Kode demo, bukan untuk pembayaran nyata.
              </p>
            </div>

            <div className="mt-7 space-y-4">
              <div className="grid grid-cols-2 items-center">
                <span className="text-xs text-[#6B7280]">
                  Nominal isi saldo
                </span>
                <span className="text-sm font-bold text-[#111827]">
                  {topUpConfirmData.amount}
                </span>
              </div>

              <div className="grid grid-cols-2 items-center">
                <span className="text-xs text-[#6B7280]">
                  Metode pembayaran
                </span>
                <span className="text-sm font-bold text-[#111827]">QRIS</span>
              </div>

              <div className="grid grid-cols-2 items-center">
                <span className="text-xs text-[#6B7280]">Biaya admin</span>
                <span className="text-sm font-medium text-[#111827]">Rp 0</span>
              </div>
            </div>

            <div className="my-6 border-t border-[#E5ECE9]" />

            <div className="grid grid-cols-2 items-center">
              <span className="text-xs text-[#6B7280]">
                Saldo setelah pembayaran
              </span>
              <span className="text-lg font-bold text-[#111827]">
                {formatRupiah(
                  topUpConfirmData?.balance + topUpConfirmData?.amount,
                )}
              </span>
            </div>

            <Button
              size="lg"
              onClick={handleSimulateQris}
              className="mt-8 w-full justify-start px-5"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Simulasikan pembayaran QRIS'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

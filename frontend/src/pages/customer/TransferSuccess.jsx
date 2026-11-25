import { Link, Navigate, useLocation } from 'react-router';
import { Check } from 'lucide-react';
import { BrandLogo } from '@/components/customs/BrandLogo';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/utils/formatRupiah';

export default function TransferSuccess() {
  const location = useLocation();
  const data = location.state;

  if (Object.keys(data).length === 0) return <Navigate to="/transfer" />;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="px-8 py-6 sm:px-12">
        <BrandLogo showIcon={false} to="/" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[540px] rounded-3xl bg-[#F7F9F8] p-8 text-center sm:p-12">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#EAF3F0] text-[#136C63]">
            <Check className="size-9 stroke-[2.75]" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
            Transfer berhasil
          </h1>
          <p className="mt-2 text-xs text-[#6B7280]">
            {formatRupiah(data.amount)} berhasil dikirim ke {data.recipientName}
            .
          </p>

          <p className="mt-7 text-xs text-[#6B7280]">
            No. referensi &nbsp;
            <span className="font-medium text-[#4B5563]">
              {data.referenceNo}
            </span>
          </p>

          <Button
            size="lg"
            render={<Link to="/activity" />}
            className="mt-8 w-full justify-start px-5"
          >
            Lihat riwayat transaksi
          </Button>

          <div className="mt-5">
            <Link
              to="/"
              className="text-xs font-semibold text-[#136C63] hover:underline"
            >
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

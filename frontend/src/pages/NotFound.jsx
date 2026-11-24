import { Link, useNavigate } from 'react-router';
import { Compass } from 'lucide-react';
import { BrandLogo } from '@/components/customs/BrandLogo';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="px-8 py-6 sm:px-12">
        <BrandLogo showIcon={false} to="/" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[540px] rounded-3xl bg-[#F7F9F8] p-8 text-center sm:p-12">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#EAF3F0] text-[#136C63]">
            <Compass className="size-9 stroke-[2.25]" />
          </div>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-[#136C63]">
            ERROR 404
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mx-auto mt-2.5 max-w-sm text-xs leading-relaxed text-[#6B7280]">
            Alamat yang kamu tuju tidak tersedia atau telah dipindahkan. Periksa
            kembali URL atau kembali ke halaman utama dompetmu.
          </p>

          <Button
            size="lg"
            render={<Link to="/" />}
            className="mt-8 w-full justify-start px-5"
          >
            Kembali ke beranda
          </Button>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-semibold text-[#136C63] hover:underline"
            >
              Kembali ke halaman sebelumnya
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

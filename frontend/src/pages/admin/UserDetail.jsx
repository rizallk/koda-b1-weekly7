import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/customs/StatusBadge';

const USER_DETAILS_MAP = {
  nadia: {
    initials: 'NP',
    name: 'Nadia Putri',
    username: '@nadia',
    email: 'nadia@example.com',
    phone: '0812 3456 7890',
    walletNumber: 'KW •••• 1842',
    joinedAt: '10 November 2026',
    status: 'Aktif',
  },
  bima: {
    initials: 'BP',
    name: 'Bima Pratama',
    username: '@bima',
    email: 'bima@example.com',
    phone: '0813 9876 5432',
    walletNumber: 'KW •••• 2941',
    joinedAt: '11 November 2026',
    status: 'Aktif',
  },
  hendra: {
    initials: 'HW',
    name: 'Hendra Wijaya',
    username: '@hendra',
    email: 'hendra@example.com',
    phone: '0811 2233 4455',
    walletNumber: 'KW •••• 7730',
    joinedAt: '12 November 2026',
    status: 'Ditangguhkan',
  },
};

export default function UserDetail() {
  const { id } = useParams();
  const user = USER_DETAILS_MAP[id] || USER_DETAILS_MAP.nadia;
  const [status, setStatus] = useState(user.status);

  const isSuspended = status === 'Ditangguhkan';

  const handleToggleStatus = () => {
    setStatus((prev) => (prev === 'Aktif' ? 'Ditangguhkan' : 'Aktif'));
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Kartu Informasi Detail Pengguna */}
      <div className="rounded-3xl bg-white p-8 lg:col-span-8">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#136C63] hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke daftar</span>
        </Link>

        {/* Profil Header */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#136C63] text-lg font-bold text-white">
              {user.initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">{user.name}</h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">{user.username}</p>
            </div>
          </div>

          <StatusBadge status={status} />
        </div>

        <div className="my-7 border-t border-[#EDF2F0]" />

        {/* Daftar Atribut Akun */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Nama lengkap
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.name}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">Email</span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.email}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Telepon
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.phone}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Nomor dompet
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.walletNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Terdaftar sejak
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.joinedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Kartu Status Akun */}
      <div className="rounded-3xl bg-white p-7 lg:col-span-4">
        <h2 className="text-lg font-bold text-[#111827]">Status akun</h2>

        <div className="mt-4">
          <StatusBadge status={status} />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[#6B7280]">
          {isSuspended
            ? 'Akun ini sedang ditangguhkan dan tidak dapat melakukan transaksi.'
            : 'Menangguhkan akun akan membatasi akses dan transaksi.'}
        </p>

        <Button
          type="button"
          size="lg"
          onClick={handleToggleStatus}
          className={
            isSuspended
              ? 'mt-6 w-full justify-start px-5'
              : 'mt-6 w-full justify-start bg-[#B84A39] px-5 text-white hover:bg-[#9e3d2e]'
          }
        >
          {isSuspended ? 'Aktifkan akun' : 'Tangguhkan akun'}
        </Button>
      </div>
    </div>
  );
}

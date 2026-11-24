import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/customs/StatusBadge';

const STATS = [
  {
    label: 'TOTAL PENGGUNA',
    value: '1.248',
    note: '+ 28 bulan ini',
  },
  {
    label: 'AKUN AKTIF',
    value: '1.190',
    note: '95,4% dari seluruh akun',
  },
  {
    label: 'AKUN DITANGGUHKAN',
    value: '58',
    note: 'Perlu pemantauan',
  },
];

const LATEST_USERS = [
  { name: 'Nadia Putri', email: 'nadia@example.com', status: 'Aktif' },
  { name: 'Bima Pratama', email: 'bima@example.com', status: 'Aktif' },
  { name: 'Rina Maharani', email: 'rina@example.com', status: 'Aktif' },
  {
    name: 'Hendra Wijaya',
    email: 'hendra@example.com',
    status: 'Ditangguhkan',
  },
];

export default function Summary() {
  return (
    <div className="space-y-6">
      {/* 3 Kartu Statistik */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-7">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              {stat.label}
            </p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[#111827]">
              {stat.value}
            </p>
            <p className="mt-3 text-xs font-medium text-[#136C63]">
              {stat.note}
            </p>
          </div>
        ))}
      </div>

      {/* Daftar Pengguna Terbaru */}
      <div className="rounded-3xl bg-white p-7 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">Pengguna terbaru</h2>
          <Link
            to="/admin/pengguna"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#136C63] hover:underline"
          >
            <span>Lihat semua</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 divide-y divide-[#EDF2F0] border-t border-[#EDF2F0]">
          {LATEST_USERS.map((user) => (
            <div
              key={user.email}
              className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:items-center"
            >
              <div className="text-sm font-semibold text-[#111827] sm:col-span-4">
                {user.name}
              </div>
              <div className="text-xs text-[#6B7280] sm:col-span-5">
                {user.email}
              </div>
              <div className="sm:col-span-3 sm:text-right">
                <StatusBadge status={user.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

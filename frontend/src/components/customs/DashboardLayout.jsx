import { Outlet, useLocation } from 'react-router';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/getInitials';
import { formatTanggalIndonesia } from '@/utils/dateFormat';

const PAGE_HEADERS = {
  '/': {
    category: 'PERSONAL WALLET',
    title: 'Beranda',
    subtitle: `${formatTanggalIndonesia()} • Selamat datang kembali.`,
  },
  '/topup': {
    category: 'TRANSAKSI',
    title: 'Isi saldo',
    subtitle: 'Pilih nominal dan metode pembayaran yang tersedia.',
  },
  '/transfer': {
    category: 'TRANSAKSI',
    title: 'Transfer saldo',
    subtitle: 'Kirim saldo dengan aman ke pengguna KodaWallet lain.',
  },
  '/activity': {
    category: 'RIWAYAT TRANSAKSI',
    title: 'Aktivitas',
    subtitle: 'Lihat riwayat transaksi dan mutasi saldo.',
  },
  '/settings': {
    category: 'AKUN SAYA',
    title: 'Pengaturan',
    subtitle: 'Perbarui informasi pribadi dan keamanan akun.',
  },
  '/admin': {
    category: 'ADMIN AREA',
    title: 'Ringkasan platform',
    subtitle: 'Pantau pertumbuhan pengguna dan status akun.',
  },
  '/admin/users': {
    category: 'PENGELOLAAN AKUN',
    title: 'Pengguna',
    subtitle: 'Kelola akun customer, status, dan akses aplikasi.',
  },
  '/admin/profile': {
    category: 'AKUN ADMIN',
    title: 'Profil',
    subtitle: 'Perbarui informasi pribadi dan keamanan akun.',
  },
};

export default function DashboardLayout({ role = 'customer' }) {
  const { user, userRole } = useAuth();
  const location = useLocation();
  const headerInfo = PAGE_HEADERS[location.pathname] || {
    category: role === 'admin' ? 'ADMIN AREA' : 'PERSONAL WALLET',
    title: 'Dashboard',
    subtitle: 'Kelola aktivitas akun KodaWallet.',
  };

  return (
    <SidebarProvider>
      <AppSidebar role={userRole} />
      <SidebarInset className="bg-[#F6F9F8]">
        <div className="mx-auto flex w-full max-w-300 flex-1 flex-col px-6 py-8 sm:px-10">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <SidebarTrigger className="mt-1 md:hidden" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#136C63]">
                  {headerInfo.category}
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">
                  {headerInfo.title}
                </h1>
                <p className="mt-1.5 text-sm text-[#6B7280]">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 rounded-full border border-[#E8EFEC] bg-white py-1.5 pl-2 pr-4 shadow-2xs">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#136C63] text-xs font-bold text-white">
                {getInitials(user.fullName)}
              </div>
              <span className="text-sm font-semibold text-[#111827]">
                {user.fullName}
              </span>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

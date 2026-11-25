import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/customs/StatusBadge';
import { formatDateTime } from '@/utils/dateFormat';
import { useUser } from '@/features/user/hooks/useUser';
import { getInitials } from '@/utils/getInitials';
import { formatUsername } from '@/utils/formatUsername';

const STATUS_LABELS = {
  ACTIVE: 'Aktif',
  SUSPENDED: 'Ditangguhkan',
};

const ROLE_LABELS = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
};

export default function UserDetail() {
  const { id } = useParams();
  const { getUserById, updateUserStatusById, isLoading } = useUser();

  const [user, setUser] = useState(null);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchUserDetail = async () => {
      const data = await getUserById(id);

      setUser(data);
    };

    fetchUserDetail();
  }, [id, fetchTrigger]);

  const normalizedStatus = String(user?.status ?? '')
    .trim()
    .toUpperCase();
  const isSuspended =
    normalizedStatus === 'SUSPENDED' ||
    normalizedStatus === 'DITANGGUHKAN' ||
    user?.isActive === false;
  const formattedStatus = isSuspended
    ? 'Ditangguhkan'
    : formatUserStatus(normalizedStatus);

  const handleSuspendAccount = async (e) => {
    e.preventDefault();
    if (!id || !user || isUpdating) return;

    setIsUpdating(true);
    const res = await updateUserStatusById(
      id,
      'SUSPENDED',
      reason.trim() || null,
    );

    if (res !== undefined) {
      setFetchTrigger((prev) => prev + 1);
      setReason('');
    }

    setIsUpdating(false);
  };

  const handleActivateAccount = async (e) => {
    e.preventDefault();
    if (!id || !user || isUpdating) return;

    setIsUpdating(true);
    const res = await updateUserStatusById(id, 'ACTIVE', reason.trim() || null);

    if (res !== undefined) {
      setFetchTrigger((prev) => prev + 1);
      setReason('');
    }

    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="rounded-3xl bg-white p-8 lg:col-span-8">
          <div className="h-4 w-32 animate-pulse rounded bg-[#EDF2F0]" />
          <div className="mt-6 flex items-center gap-4">
            <div className="size-14 animate-pulse rounded-full bg-[#EDF2F0]" />
            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded bg-[#EDF2F0]" />
              <div className="h-3.5 w-28 animate-pulse rounded bg-[#F3F6F5]" />
            </div>
          </div>
          <div className="my-7 border-t border-[#EDF2F0]" />
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={`detail-skeleton-${idx}`}
                className="grid grid-cols-1 gap-2 sm:grid-cols-12"
              >
                <div className="h-3.5 w-24 animate-pulse rounded bg-[#F3F6F5] sm:col-span-4" />
                <div className="h-4 w-48 animate-pulse rounded bg-[#EDF2F0] sm:col-span-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-7 lg:col-span-4">
          <div className="h-5 w-28 animate-pulse rounded bg-[#EDF2F0]" />
          <div className="mt-4 h-6 w-24 animate-pulse rounded-full bg-[#EDF2F0]" />
          <div className="mt-4 h-10 w-full animate-pulse rounded bg-[#F3F6F5]" />
          <div className="mt-6 h-11 w-full animate-pulse rounded-xl bg-[#EDF2F0]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl bg-white p-8">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#136C63] hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke daftar</span>
        </Link>
        <p className="mt-6 text-sm text-[#6B7280]">
          Data pengguna tidak ditemukan.
        </p>
      </div>
    );
  }

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
              {getInitials(user.fullName)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                {user.fullName}
              </h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {formatUsername(user.userName)}
              </p>
            </div>
          </div>

          <StatusBadge status={formattedStatus} />
        </div>

        <div className="my-7 border-t border-[#EDF2F0]" />

        {/* Daftar Atribut Akun */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Nama lengkap
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.fullName}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">Email</span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.email ?? '-'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Telepon
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.phoneNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">Role</span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {formatUserRole(user)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Nomor dompet
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {user.wallet?.walletNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-12">
            <span className="text-xs text-[#6B7280] sm:col-span-4">
              Terdaftar sejak
            </span>
            <span className="text-sm font-semibold text-[#111827] sm:col-span-8">
              {formatDateTime(user.createdAtUtc)}
            </span>
          </div>
        </div>
      </div>

      {/* Kartu Status Akun */}
      <div className="rounded-3xl bg-white p-7 lg:col-span-4">
        <h2 className="text-lg font-bold text-[#111827]">Status akun</h2>

        <div className="mt-4">
          <StatusBadge status={formattedStatus} />
        </div>

        {isSuspended ? (
          /* Tampilan ketika status akun DITANGGUHKAN */
          <form onSubmit={handleActivateAccount}>
            <p className="mt-4 text-xs leading-relaxed text-[#6B7280]">
              Akun ini sedang ditangguhkan dan tidak dapat melakukan transaksi.
            </p>

            <div className="mt-4">
              <label
                htmlFor="activate-reason"
                className="mb-1.5 block text-xs font-medium text-[#111827]"
              >
                Alasan pengaktifan (opsional)
              </label>
              <Input
                id="activate-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isUpdating}
                placeholder="Contoh: Verifikasi akun telah selesai"
                className="h-10 text-xs"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isUpdating}
              className="mt-5 w-full justify-start px-5"
            >
              {isUpdating ? 'Mengaktifkan akun...' : 'Aktifkan akun'}
            </Button>
          </form>
        ) : (
          /* Tampilan ketika status akun AKTIF */
          <form onSubmit={handleSuspendAccount}>
            <p className="mt-4 text-xs leading-relaxed text-[#6B7280]">
              Menangguhkan akun akan membatasi akses dan transaksi pengguna.
            </p>

            <div className="mt-4">
              <label
                htmlFor="suspend-reason"
                className="mb-1.5 block text-xs font-medium text-[#111827]"
              >
                Alasan penangguhan (opsional)
              </label>
              <Input
                id="suspend-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isUpdating}
                placeholder="Contoh: Terdeteksi aktivitas mencurigakan"
                className="h-10 text-xs"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isUpdating}
              className="mt-5 w-full justify-start bg-[#B84A39] px-5 text-white hover:bg-[#9e3d2e]"
            >
              {isUpdating ? 'Menangguhkan akun...' : 'Tangguhkan akun'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ===================================================

function formatUserStatus(status) {
  if (!status) return 'Aktif';
  return STATUS_LABELS[status] ?? status;
}

function formatUserRole(user) {
  const rawRole = Array.isArray(user?.roles) ? user.roles[0] : user?.role;
  if (!rawRole) return '-';
  const normalized = String(rawRole).toUpperCase();
  return ROLE_LABELS[normalized] ?? normalized;
}

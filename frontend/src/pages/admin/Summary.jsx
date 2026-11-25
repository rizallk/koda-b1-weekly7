import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/customs/StatusBadge';
import { useUser } from '@/features/user/hooks/useUser';
import { useEffect, useState } from 'react';

const STATUS_LABELS = {
  ACTIVE: 'Berhasil',
  SUSPENDED: 'Gagal',
};

export default function Summary() {
  const { getUserSummary, getAllUsers } = useUser();

  const [userSummary, setUserSummary] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchUserSummary = async () => {
      try {
        const data = await getUserSummary();

        setUserSummary(data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRecentUsers = async () => {
      try {
        const data = await getAllUsers({ pageSize: 4 });

        setRecentUsers(data?.items);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserSummary();
    fetchRecentUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* 3 Kartu Statistik */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-7">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            TOTAL PENGGUNA
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111827]">
            {userSummary?.totalUsers || 0}
          </p>
          {/* <p className="mt-3 text-xs font-medium text-[#136C63]">note</p> */}
        </div>
        <div className="rounded-3xl bg-white p-7">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            AKUN AKTIF
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111827]">
            {userSummary?.totalUsersActive || 0}
          </p>
          {/* <p className="mt-3 text-xs font-medium text-[#136C63]">note</p> */}
        </div>
        <div className="rounded-3xl bg-white p-7">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            AKUN DITANGGUHKAN
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111827]">
            {userSummary?.totalUsersSuspended || 0}
          </p>
          {/* <p className="mt-3 text-xs font-medium text-[#136C63]">note</p> */}
        </div>
      </div>

      {/* Daftar Pengguna Terbaru */}
      <div className="rounded-3xl bg-white p-7 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">Pengguna terbaru</h2>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#136C63] hover:underline"
          >
            <span>Lihat semua</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 divide-y divide-[#EDF2F0] border-t border-[#EDF2F0]">
          {recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <div
                key={user.email}
                className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:items-center"
              >
                <div className="text-sm font-semibold text-[#111827] sm:col-span-4">
                  {user.fullName}
                </div>
                <div className="text-xs text-[#6B7280] sm:col-span-5">
                  {user.email}
                </div>
                <div className="sm:col-span-3 sm:text-right">
                  <StatusBadge status={STATUS_LABELS[user.status]} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm my-4 text-gray-600">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

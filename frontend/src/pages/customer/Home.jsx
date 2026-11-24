import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { useEffect, useState } from 'react';
import { formatRupiah } from '@/utils/formatRupiah';
import { walletStatusFormat } from '@/utils/walletStatusFormat';
import { useUser } from '@/features/user/hooks/useUser';
import { formatDateTime } from '@/utils/dateFormat';

export default function Home() {
  const { getMyWallet } = useWallet();
  const { getUserMutations } = useUser();
  const [myWallet, setMyWallet] = useState({});
  const [recentMutations, setRecentMutations] = useState([]);

  useEffect(() => {
    const fetchMyWallet = async () => {
      try {
        const data = await getMyWallet();

        setMyWallet(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchRecentMutations = async () => {
      try {
        const data = await getUserMutations({ pageSize: 3 });

        setRecentMutations(data?.items);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMyWallet();
    fetchRecentMutations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-3xl bg-[#136C63] p-8 text-white lg:col-span-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
              SALDO TERSEDIA
            </p>
            <p className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatRupiah(myWallet?.balance)}
            </p>
            <p className="mt-4 text-sm text-white/85">
              Nomor dompet &nbsp;·&nbsp; {myWallet?.walletNumber}
            </p>
          </div>

          <div className="mt-6">
            {walletStatusFormat(myWallet?.walletStatus || '')}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-7 lg:col-span-4">
          <h2 className="text-lg font-bold text-[#111827]">Aksi cepat</h2>
          <p className="mt-1 text-xs text-[#6B7280]">
            Transaksi yang sering digunakan
          </p>

          <div className="mt-6 space-y-3">
            <Button
              size="lg"
              className="w-full justify-start gap-2.5"
              render={<Link to="/topup" />}
            >
              <Plus className="size-4" />
              <span>Isi Saldo</span>
            </Button>

            <Button
              variant="soft"
              size="lg"
              className="w-full justify-start gap-2.5"
              render={<Link to="/transfer" />}
            >
              <ArrowUpRight className="size-4" />
              <span>Transfer</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-7 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              Aktivitas terakhir
            </h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              Pantau pergerakan uang di dompetmu
            </p>
          </div>
          <Link
            to="/activity"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#136C63] hover:underline"
          >
            <span>Lihat semua</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-6 divide-y divide-[#EDF2F0] border-t border-[#EDF2F0]">
          {recentMutations.length > 0 ? (
            recentMutations.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-5">
                  <p className="text-sm font-semibold text-[#111827]">
                    {item?.description}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {formatDateTime(item.createdAtUtc)}
                  </p>
                </div>
                <div className="text-xs text-[#6B7280] sm:col-span-3">
                  {item.type}
                </div>
                <div className="text-sm font-bold text-[#111827] sm:col-span-2">
                  {item?.direction === 'IN' ? '+' : '-'}{' '}
                  {formatRupiah(item.amount)}
                </div>
                <div className="text-xs font-semibold text-[#136C63] sm:col-span-2 sm:text-right">
                  BERHASIL
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

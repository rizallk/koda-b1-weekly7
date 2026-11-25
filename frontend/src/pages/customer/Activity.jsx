import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/customs/StatusBadge';
import { TablePagination } from '@/components/customs/TablePagination';
import { formatDateTime } from '@/utils/dateFormat';
import { useUser } from '@/features/user/hooks/useUser';

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  TOPUP: 'TOP UP',
  TRANSFER: 'TRANSFER',
};

const STATUS_LABELS = {
  SUCCESS: 'Berhasil',
  PENDING: 'Menunggu',
  FAILED: 'Gagal',
};

export default function Activity() {
  const { getUserTransactions, getUserProfile, isLoading } = useUser();

  const [userWalletId, setUserWalletId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL TYPE');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [dateFilter, setDateFilter] = useState('ALL DATE');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchWalletId = async () => {
      const profileRes = await getUserProfile();
      if (!profileRes) return;

      const profile = profileRes?.data ?? profileRes;
      const walletId =
        profile?.walletId ??
        profile?.wallet?.id ??
        profile?.wallet?.walletId ??
        null;

      setUserWalletId(walletId);
    };

    fetchWalletId();
  }, [getUserProfile]);

  // Debounce input pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isCancelled = false;

    const fetchTransactions = async () => {
      const { startDate, endDate } = getDateRangeParams(dateFilter);

      const res = await getUserTransactions({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        type: typeFilter === 'ALL TYPE' ? '' : typeFilter,
        status: statusFilter === 'ALL STATUS' ? '' : statusFilter,
        startDate,
        endDate,
      });

      if (isCancelled) return;

      const payload = Array.isArray(res?.items) ? res : (res?.data ?? res);
      const items = Array.isArray(payload?.items) ? payload.items : [];

      setTransactions(items);
      setPaginationMeta({
        page: payload?.page ?? currentPage,
        pageSize: payload?.pageSize ?? PAGE_SIZE,
        totalCount: payload?.totalCount ?? items.length,
        totalPages: payload?.totalPages ?? 1,
      });
    };

    fetchTransactions();

    return () => {
      isCancelled = true;
    };
  }, [
    getUserTransactions,
    currentPage,
    debouncedSearch,
    typeFilter,
    statusFilter,
    dateFilter,
  ]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-3xl bg-white p-7 sm:p-8">
      <h2 className="text-xl font-bold text-[#111827]">Riwayat transaksi</h2>

      {/* Filter Toolbar */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nomor referensi..."
            className="h-11"
          />
        </div>

        <div className="md:col-span-2">
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-[#F3F6F5] px-4 text-xs font-medium text-[#111827]">
              <SelectValue placeholder="Semua tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL TYPE">Semua tipe</SelectItem>
              <SelectItem value="TOPUP">Top Up</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-[#F3F6F5] px-4 text-xs font-medium text-[#111827]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL STATUS">Semua status</SelectItem>
              <SelectItem value="SUCCESS">Berhasil</SelectItem>
              <SelectItem value="PENDING">Menunggu</SelectItem>
              <SelectItem value="FAILED">Gagal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <Select value={dateFilter} onValueChange={handleDateChange}>
            <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-[#F3F6F5] px-4 text-xs font-medium text-[#111827]">
              <SelectValue placeholder="Rentang tanggal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL DATE">Rentang tanggal</SelectItem>
              <SelectItem value="7d">7 hari terakhir</SelectItem>
              <SelectItem value="30d">30 hari terakhir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#EDF2F0] hover:bg-transparent">
              <TableHead className="h-10 w-10 px-0 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                NO
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                TRANSAKSI
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                JENIS
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                NOMINAL
              </TableHead>
              <TableHead className="h-10 px-0 text-right text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                STATUS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow
                  key={`skeleton-${idx}`}
                  className="border-b border-[#EDF2F0]"
                >
                  <TableCell className="px-0 py-4">
                    <div className="h-3.5 w-5 animate-pulse rounded bg-[#EDF2F0]" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-4 w-44 animate-pulse rounded bg-[#EDF2F0]" />
                    <div className="mt-2 h-3 w-36 animate-pulse rounded bg-[#F3F6F5]" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-3.5 w-20 animate-pulse rounded bg-[#EDF2F0]" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-[#EDF2F0]" />
                  </TableCell>
                  <TableCell className="px-0 py-4 text-right">
                    <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-[#EDF2F0]" />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-xs text-[#6B7280]"
                >
                  Tidak ada transaksi yang sesuai dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((trx, idx) => {
                const rowNumber =
                  (paginationMeta.page - 1) * paginationMeta.pageSize + idx + 1;

                return (
                  <TableRow
                    key={trx.id ?? trx.referenceNo}
                    className="border-b border-[#EDF2F0] hover:bg-[#F9FBFA]"
                  >
                    <TableCell className="px-0 py-4 text-xs font-medium text-[#6B7280]">
                      {rowNumber}
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-semibold text-[#111827]">
                        {getTransactionTitle(trx, userWalletId)}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        {trx.referenceNo}
                        {trx.createdAtUtc &&
                          ` · ${formatDateTime(trx.createdAtUtc)}`}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-xs font-medium text-[#6B7280]">
                      {formatTransactionType(trx.type)}
                    </TableCell>
                    <TableCell className="py-4 text-sm font-bold text-[#111827]">
                      {formatTransactionAmount(trx, userWalletId)}
                    </TableCell>
                    <TableCell className="px-0 py-4 text-right">
                      <StatusBadge
                        status={formatTransactionStatus(trx.status)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        meta={paginationMeta}
        onPageChange={(newPage) => setCurrentPage(newPage)}
        itemLabel="transaksi"
      />
    </div>
  );
}

// ===================================================

function formatTransactionAmount(trx, userWalletId) {
  const numericAmount = Math.abs(Number(trx.amount ?? 0));
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  const type = String(trx.type ?? '').toUpperCase();
  if (type === 'TOPUP') {
    return `+ Rp${formatted}`;
  }

  if (type === 'TRANSFER') {
    const direction = String(trx.direction ?? '').toUpperCase();
    if (direction === 'IN' || direction === 'CREDIT') {
      return `+ Rp${formatted}`;
    }
    if (direction === 'OUT' || direction === 'DEBIT') {
      return `- Rp${formatted}`;
    }

    if (userWalletId != null) {
      if (Number(trx.senderWalletId) === Number(userWalletId)) {
        return `- Rp${formatted}`;
      }
      if (Number(trx.receiverWalletId) === Number(userWalletId)) {
        return `+ Rp${formatted}`;
      }
    }
  }

  return `Rp${formatted}`;
}

function formatTransactionType(type) {
  if (!type) return '-';
  const normalized = String(type).toUpperCase();
  return TYPE_LABELS[normalized] ?? normalized;
}

function formatTransactionStatus(status) {
  if (!status) return 'Berhasil';
  const normalized = String(status).toUpperCase();
  return STATUS_LABELS[normalized] ?? status;
}

function getDateRangeParams(dateFilter) {
  if (dateFilter === 'ALL') {
    return { startDate: '', endDate: '' };
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);
  const days = dateFilter === '7d' ? 7 : 30;
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

function getTransactionTitle(trx, userWalletId) {
  if (trx.description && trx.description.trim() !== '') {
    return trx.description;
  }

  const type = String(trx.type ?? '').toUpperCase();
  if (type === 'TOPUP') {
    return 'Top up saldo';
  }

  if (type === 'TRANSFER') {
    if (userWalletId != null) {
      if (Number(trx.senderWalletId) === Number(userWalletId)) {
        return 'Transfer keluar';
      }
      if (Number(trx.receiverWalletId) === Number(userWalletId)) {
        return 'Transfer masuk';
      }
    }
    return 'Transfer';
  }

  return type || '-';
}

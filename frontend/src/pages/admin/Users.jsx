import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
import { useUser } from '@/features/user/hooks/useUser';
import { Link } from 'react-router';

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  ACTIVE: 'Aktif',
  SUSPENDED: 'Ditangguhkan',
};

const ROLE_LABELS = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
};

export default function Users() {
  const { getAllUsers, isLoading } = useUser();

  const [users, setUsers] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');
  const [roleFilter, setRoleFilter] = useState('ALL ROLE');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce input pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getAllUsers({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: statusFilter === 'ALL STATUS' ? '' : statusFilter,
        role: roleFilter === 'ALL ROLE' ? '' : roleFilter,
      });

      console.log(res);

      const payload = Array.isArray(res?.items) ? res : (res?.data ?? res);
      const items = Array.isArray(payload?.items) ? payload.items : [];

      setUsers(items);
      setPaginationMeta({
        page: payload?.page ?? currentPage,
        pageSize: payload?.pageSize ?? PAGE_SIZE,
        totalCount: payload?.totalCount ?? items.length,
        totalPages: payload?.totalPages ?? 1,
      });
    };

    fetchUsers();
  }, [getAllUsers, currentPage, debouncedSearch, statusFilter, roleFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-3xl bg-white p-7 sm:p-8">
      <h2 className="text-xl font-bold text-[#111827]">Daftar pengguna</h2>
      <p className="mt-1 text-xs text-[#6B7280]">
        Temukan akun berdasarkan nama, username, atau email.
      </p>

      {/* Filter Toolbar */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-6">
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nama, username, atau email..."
            className="h-11"
          />
        </div>

        <div className="md:col-span-3">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-[#F3F6F5] px-4 text-xs font-medium text-[#111827]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL STATUS">Semua status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-[#F3F6F5] px-4 text-xs font-medium text-[#111827]">
              <SelectValue placeholder="Semua role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL ROLE">Semua role</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#EDF2F0] hover:bg-transparent">
              <TableHead className="h-10 w-10 px-0 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                NO
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                PENGGUNA
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                EMAIL
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                ROLE
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                STATUS
              </TableHead>
              <TableHead className="h-10 px-0 text-right text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                AKSI
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
                    <div className="h-4 w-36 animate-pulse rounded bg-[#EDF2F0]" />
                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#F3F6F5]" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-3.5 w-44 animate-pulse rounded bg-[#EDF2F0]" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-3.5 w-20 animate-pulse rounded bg-[#EDF2F0]" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-[#EDF2F0]" />
                  </TableCell>
                  <TableCell className="px-0 py-4 text-right">
                    <div className="ml-auto h-4 w-14 animate-pulse rounded bg-[#EDF2F0]" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-xs text-[#6B7280]"
                >
                  Tidak ada pengguna yang sesuai dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, idx) => {
                const rowNumber =
                  (paginationMeta.page - 1) * paginationMeta.pageSize + idx + 1;

                return (
                  <TableRow
                    key={user.id ?? user.email}
                    className="border-b border-[#EDF2F0] hover:bg-[#F9FBFA]"
                  >
                    <TableCell className="px-0 py-4 text-xs font-medium text-[#6B7280]">
                      {rowNumber}
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-semibold text-[#111827]">
                        {user.fullName ?? '-'}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        {formatUsername(user.userName)}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-xs text-[#6B7280]">
                      {user.email ?? '-'}
                    </TableCell>
                    <TableCell className="py-4 text-xs font-medium text-[#6B7280]">
                      {formatUserRole(user)}
                    </TableCell>
                    <TableCell className="py-4">
                      <StatusBadge status={formatUserStatus(user.status)} />
                    </TableCell>
                    <TableCell className="px-0 py-4 text-right">
                      <Link
                        to={`${user.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#136C63] hover:underline"
                      >
                        <span>Detail</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
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
        itemLabel="pengguna"
      />
    </div>
  );
}

// ===================================================

function formatUsername(username) {
  if (!username) return '-';
  return username.startsWith('@') ? username : `@${username}`;
}

function formatUserStatus(status) {
  if (!status) return 'Aktif';
  const normalized = String(status).toUpperCase();
  return STATUS_LABELS[normalized] ?? status;
}

function formatUserRole(user) {
  const rawRole = Array.isArray(user?.roles) ? user.roles[0] : user?.role;
  if (!rawRole) return '-';
  const normalized = String(rawRole).toUpperCase();
  return ROLE_LABELS[normalized] ?? normalized;
}

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const USERS_DATA = [
  {
    name: 'Nadia Putri',
    username: '@nadia',
    email: 'nadia@example.com',
    status: 'Aktif',
  },
  {
    name: 'Bima Pratama',
    username: '@bima',
    email: 'bima@example.com',
    status: 'Aktif',
  },
  {
    name: 'Rina Maharani',
    username: '@rina',
    email: 'rina@example.com',
    status: 'Aktif',
  },
  {
    name: 'Hendra Wijaya',
    username: '@hendra',
    email: 'hendra@example.com',
    status: 'Ditangguhkan',
  },
  {
    name: 'Dian Ayu',
    username: '@dian',
    email: 'dian@example.com',
    status: 'Aktif',
  },
];

export default function Users() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = USERS_DATA.filter((user) => {
    const matchQuery =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' || user.status.toLowerCase() === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="rounded-3xl bg-white p-7 sm:p-8">
      <h2 className="text-xl font-bold text-[#111827]">Daftar pengguna</h2>
      <p className="mt-1 text-xs text-[#6B7280]">
        Temukan akun berdasarkan nama, username, atau email.
      </p>

      {/* Filter Toolbar */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-7">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengguna..."
            className="h-11"
          />
        </div>

        <div className="md:col-span-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-full rounded-xl border-0 bg-[#F3F6F5] px-4 text-xs font-medium text-[#111827]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="ditangguhkan">Ditangguhkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Button
            type="button"
            variant="soft"
            className="h-11 w-full justify-start px-5"
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#EDF2F0] hover:bg-transparent">
              <TableHead className="h-10 px-0 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                PENGGUNA
              </TableHead>
              <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                EMAIL
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
            {filteredUsers.map((user) => (
              <TableRow
                key={user.email}
                className="border-b border-[#EDF2F0] hover:bg-[#F9FBFA]"
              >
                <TableCell className="px-0 py-4">
                  <p className="text-sm font-semibold text-[#111827]">
                    {user.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {user.username}
                  </p>
                </TableCell>
                <TableCell className="py-4 text-xs text-[#6B7280]">
                  {user.email}
                </TableCell>
                <TableCell className="py-4">
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="px-0 py-4 text-right">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#136C63] hover:underline"
                  >
                    <span>Detail</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-6 text-xs text-[#6B7280]">
        Menampilkan {filteredUsers.length} dari 1.248 akun
      </p>
    </div>
  );
}

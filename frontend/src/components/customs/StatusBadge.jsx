import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  aktif: 'bg-[#E1F5EA] text-[#137347] hover:bg-[#E1F5EA]',
  berhasil: 'bg-[#E1F5EA] text-[#137347] hover:bg-[#E1F5EA]',
  menunggu: 'bg-[#FEF6E7] text-[#B45309] hover:bg-[#FEF6E7]',
  gagal: 'bg-[#FDECEC] text-[#D9383A] hover:bg-[#FDECEC]',
  ditangguhkan: 'bg-[#FDECEC] text-[#D9383A] hover:bg-[#FDECEC]',
};

export function StatusBadge({ status, uppercase = false, className }) {
  const key = status?.toLowerCase() || 'aktif';
  return (
    <Badge
      variant="secondary"
      className={cn(
        'rounded-full border-0 px-3.5 py-1 text-xs font-semibold shadow-none',
        uppercase && 'uppercase tracking-wider text-[11px]',
        STATUS_STYLES[key] || STATUS_STYLES.aktif,
        className,
      )}
    >
      {status}
    </Badge>
  );
}

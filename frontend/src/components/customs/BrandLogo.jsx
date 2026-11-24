import { Link } from 'react-router';

export function BrandLogo({ showIcon = true, to = '/' }) {
  return (
    <Link to={to} className="inline-flex items-center gap-3 select-none">
      {showIcon && (
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#136C63] text-xl font-bold text-white shadow-xs">
          k
        </div>
      )}
      <span className="text-xl tracking-tight">
        <strong className="font-bold text-[#111827]">koda</strong>
        <span className="font-medium text-[#136C63]">wallet</span>
      </span>
    </Link>
  );
}

import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

function Input({ className, type, errorMsg, ...props }) {
  return (
    <>
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          'flex h-12 w-full rounded-xl border border-transparent bg-[#F3F6F5] px-4 py-2 text-sm text-[#111827] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#7A8682] focus-visible:border-[#136C63]/40 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136C63]/15 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      {errorMsg && (
        <label className="mb-2 mt-2 block text-xs font-semibold text-red-400">
          {errorMsg}
        </label>
      )}
    </>
  );
}

export { Input };

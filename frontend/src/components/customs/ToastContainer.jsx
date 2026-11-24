const VARIANT_CONFIG = {
  success: {
    defaultTitle: 'Berhasil',
    containerClass:
      'border-emerald-300 bg-white text-slate-800 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100',
    iconWrapperClass:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    defaultTitle: 'Terjadi Kesalahan',
    containerClass:
      'border-rose-300 bg-white text-slate-800 dark:border-rose-800/60 dark:bg-slate-900 dark:text-slate-100',
    iconWrapperClass:
      'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    defaultTitle: 'Peringatan',
    containerClass:
      'border-amber-300 bg-white text-slate-800 dark:border-amber-800/60 dark:bg-slate-900 dark:text-slate-100',
    iconWrapperClass:
      'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    defaultTitle: 'Informasi',
    containerClass:
      'border-sky-200 bg-white text-slate-800 dark:border-sky-800/60 dark:bg-slate-900 dark:text-slate-100',
    iconWrapperClass:
      'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

export default function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0"
    >
      {toasts.map((item) => {
        const variant = VARIANT_CONFIG[item.type] || VARIANT_CONFIG.info;

        return (
          <div
            key={item.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg shadow-slate-900/10 backdrop-blur-sm transition-all duration-200 ${
              variant.containerClass
            } ${
              item.isClosing ? 'translate-x-full opacity-0' : 'animate-toast-in'
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${variant.iconWrapperClass}`}
            >
              {variant.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5">
                {item.title || variant.defaultTitle}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label="Tutup notifikasi"
              className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

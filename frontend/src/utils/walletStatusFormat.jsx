export const walletStatusFormat = (status) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#136C63]">
          <span className="size-2 rounded-full bg-[#136C63]" />
          {status[0]}
          {status.slice(1).toLowerCase()}
        </span>
      );

    case 'FROZEN':
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-orange-500">
          <span className="size-2 rounded-full bg-orange-500" />
          {status[0]}
          {status.slice(1).toLowerCase()}
        </span>
      );

    case 'CLOSED':
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-red-500">
          <span className="size-2 rounded-full bg-red-500" />
          {status[0]}
          {status.slice(1).toLowerCase()}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-gray-500">
          <span className="size-2 rounded-full bg-gray-500" />
          {status[0]}
          {status.slice(1).toLowerCase()}
        </span>
      );
  }
};

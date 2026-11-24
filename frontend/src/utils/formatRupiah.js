export const formatRupiah = (amount) => {
  const number = Number(amount);

  if (isNaN(number)) return 'Rp 0';

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);

  return `Rp ${formatted}`;
};

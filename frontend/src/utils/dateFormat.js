export function formatTanggalIndonesia(date = new Date()) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Format tanggal tidak valid');
  }

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
}

// ==============================================

export function formatDateTime(isoString, treatAsUTC = true) {
  if (!isoString) return '-';

  let normalized = isoString.replace(/(\.\d{3})\d+/, '$1');

  if (
    treatAsUTC &&
    !normalized.endsWith('Z') &&
    !/[+-]\d{2}:\d{2}$/.test(normalized)
  ) {
    normalized += 'Z';
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '-';

  const datePart = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(date)
    .replace(':', '.');

  return `${datePart} · ${timePart}`;
}

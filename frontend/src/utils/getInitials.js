export function getInitials(fullName, fallback = '--') {
  if (typeof fullName !== 'string') {
    return fallback;
  }

  const words = fullName.trim().split(/\s+/).filter(Boolean);

  if (words.length < 2) {
    return fallback;
  }

  const firstInitial = words[0].charAt(0);
  const secondInitial = words[1].charAt(0);

  const isLetter = /^[a-zA-ZÀ-ÿ]$/;
  if (!isLetter.test(firstInitial) || !isLetter.test(secondInitial)) {
    return fallback;
  }

  return `${firstInitial}${secondInitial}`.toUpperCase();
}

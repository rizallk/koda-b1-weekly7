export function formatUsername(username) {
  if (!username) return '-';
  return username.startsWith('@') ? username : `@${username}`;
}

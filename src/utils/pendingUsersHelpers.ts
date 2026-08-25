export interface UserWithName {
  name?: string | null;
}

/**
 * Formats a list of pending users for copying to clipboard (e.g. for WhatsApp/Slack announcements).
 *
 * Requirements:
 * - Header in bold & italic: "*_Those who haven't made selection for this week_*"
 * - Each name on a separate line.
 * - Names should be first names only, unless the same first name appears more than once,
 *   in which case the full name is shown.
 * - Names should be boldened (e.g. "*Alice*").
 */
export function formatPendingUsersForClipboard(
  users: Array<UserWithName | string>,
): string {
  const validUsers = users
    .map((u) => (typeof u === 'string' ? u : u?.name || ''))
    .map((name) => name.trim())
    .filter(Boolean);

  if (validUsers.length === 0) {
    return '';
  }

  // Count occurrences of each first name (case-insensitive)
  const firstNameCounts = new Map<string, number>();
  for (const name of validUsers) {
    const firstName = name.split(/\s+/)[0].replace(/,+$/, '').toLowerCase();
    firstNameCounts.set(firstName, (firstNameCounts.get(firstName) || 0) + 1);
  }

  const formattedNames = validUsers.map((fullName) => {
    const firstName = fullName.split(/\s+/)[0].replace(/,+$/, '');
    const normalizedFirst = firstName.toLowerCase();
    const count = firstNameCounts.get(normalizedFirst) || 0;
    const displayName = count > 1 ? fullName : firstName;
    return `*${displayName}*`;
  });

  const header = `*_Those who haven't made selection for this week_*`;
  return [header, ...formattedNames].join('\n');
}

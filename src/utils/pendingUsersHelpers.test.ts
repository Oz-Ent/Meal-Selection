import { formatPendingUsersForClipboard } from './pendingUsersHelpers';

describe('formatPendingUsersForClipboard', () => {
  it('returns empty string when user list is empty', () => {
    expect(formatPendingUsersForClipboard([])).toBe('');
  });

  it('formats unique names using only their first names', () => {
    const users = [
      { name: 'Justice Awuley Addico' },
      { name: 'Abigail Agada' },
      { name: 'Sanctify Yayra Ayiku' },
    ];

    const result = formatPendingUsersForClipboard(users);
    expect(result).toBe(
      `*_Those who haven't made selection for this week_*\n*Justice*\n*Abigail*\n*Sanctify*`,
    );
  });

  it('shows full names when first names appear multiple times', () => {
    const users = [
      { name: 'Alice Smith' },
      { name: 'Bob Johnson' },
      { name: 'Alice Jones' },
      { name: 'Charlie Brown' },
    ];

    const result = formatPendingUsersForClipboard(users);
    expect(result).toBe(
      `*_Those who haven't made selection for this week_*\n*Alice Smith*\n*Bob*\n*Alice Jones*\n*Charlie*`,
    );
  });

  it('handles duplicate detection case-insensitively', () => {
    const users = [
      { name: 'alice smith' },
      { name: 'Alice Jones' },
      { name: 'David Lee' },
    ];

    const result = formatPendingUsersForClipboard(users);
    expect(result).toBe(
      `*_Those who haven't made selection for this week_*\n*alice smith*\n*Alice Jones*\n*David*`,
    );
  });

  it('supports array of string names and trims whitespace', () => {
    const users = ['  John Doe  ', 'Jane Doe', 'John Smith'];

    const result = formatPendingUsersForClipboard(users);
    expect(result).toBe(
      `*_Those who haven't made selection for this week_*\n*John Doe*\n*Jane*\n*John Smith*`,
    );
  });

  it('handles names with comma-separated format properly', () => {
    const users = [
      { name: 'Kuditchar, Bernard' },
      { name: 'Eric Joel' },
    ];

    const result = formatPendingUsersForClipboard(users);
    expect(result).toBe(
      `*_Those who haven't made selection for this week_*\n*Kuditchar*\n*Eric*`,
    );
  });

  it('filters out invalid or empty user names', () => {
    const users = [
      { name: '' },
      { name: '   ' },
      { name: 'Alice Cooper' },
    ];

    const result = formatPendingUsersForClipboard(users);
    expect(result).toBe(
      `*_Those who haven't made selection for this week_*\n*Alice*`,
    );
  });
});

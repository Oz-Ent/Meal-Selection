const REPLACEMENTS: [RegExp, string][] = [
  [/\bwith\b/gi, 'w/'],
  [/\band\b/gi, '&'],
];

export const parseMealName = (name: string): string => {
  if (!name) return '';

  return REPLACEMENTS.reduce(
    (result, [regex, replacement]) =>
      result.replace(regex, replacement),
    name,
  )
    .replace(/\s+/g, ' ')
    .trim();
};
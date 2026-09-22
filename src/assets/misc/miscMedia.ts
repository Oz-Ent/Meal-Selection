// Collect all media dynamically from src/assets/misc
interface MediaModule {
  default?: string;
  [key: string]: unknown;
}

const miscMediaModules = import.meta.glob?.<MediaModule | string>(
  './*.{mp4,webm,ogg,gif,png,jpg,jpeg,webp,svg}',
  { eager: true },
) ?? {};

export const miscMediaList: string[] = Object.values(miscMediaModules)
  .map((mod) => (typeof mod === 'string' ? mod : mod?.default ?? ''))
  .filter(Boolean);


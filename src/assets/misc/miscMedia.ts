// Collect all media dynamically from src/assets/misc
interface MediaModule {
  default?: string;
  [key: string]: any;
}

const miscMediaModules = (
  typeof import.meta !== 'undefined' && typeof (import.meta as any).glob === 'function'
    ? (import.meta as any).glob('./*.{mp4,webm,ogg,gif,png,jpg,jpeg,webp,svg}', { eager: true })
    : {}
) as Record<string, MediaModule | string>;

export const miscMediaList: string[] = Object.values(miscMediaModules)
  .map((mod) => (typeof mod === 'string' ? mod : mod?.default ?? ''))
  .filter(Boolean);


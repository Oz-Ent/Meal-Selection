interface ImportMetaEnv {
  readonly VITE_MEAL_APP_CORE?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly PUSH_CONFIG_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob?: <T = any>(
    pattern: string | string[],
    options?: {
      as?: string;
      eager?: boolean;
      import?: string;
      query?: string | Record<string, string | number | boolean>;
      exhaustive?: boolean;
    }
  ) => Record<string, T>;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: { [key: string]: string };
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

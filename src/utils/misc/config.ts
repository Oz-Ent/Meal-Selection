﻿export const MEAL_APP_CORE =
  import.meta.env.VITE_MEAL_APP_CORE ?? 'https://meal-app-core-dev.vercel.app';

export const VAPID_PUBLIC_KEY =
  (import.meta.env as unknown as { VITE_VAPID_PUBLIC_KEY?: string }).VITE_VAPID_PUBLIC_KEY ??
  'hm-Public-2026hmdhhub25';

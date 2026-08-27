// Jest stand-in for config.ts: ts-jest compiles to CommonJS where `import.meta`
// is not allowed, so tests resolve this CJS-safe module instead (see jest.config.js).
export const MEAL_APP_CORE = 'https://meal-app-core.vercel.app';

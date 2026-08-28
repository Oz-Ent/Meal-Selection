/// <reference types="cypress" />

// Cypress E2E support file
// This file runs before each e2e test

// Disable uncaught exception handling for Cypress
Cypress.on('uncaught:exception', () => {
  // Return false to prevent Cypress from failing the test
  return false;
});

interface SeedAuthOptions {
  id?: number;
  name?: string;
  email?: string;
  roleId?: number;
  roleName?: string;
  token?: string;
}

// Seed an authenticated session in localStorage using the same nested shape
// (`IAuthUser`) the app persists after login. The app reads `profile.user`
// (e.g. AdminProtectedRoute), so a flat user object crashes those routes.
Cypress.Commands.add('seedAuth', (options: SeedAuthOptions = {}) => {
  const authUser = {
    user: {
      id: options.id ?? 1,
      email: options.email ?? 'user@example.com',
      name: options.name ?? 'Test User',
      roleId: options.roleId ?? 2,
      roleName: options.roleName ?? 'user',
    },
    availability: {
      startDate: '',
      endDate: '',
    },
  };

  window.localStorage.setItem('token', options.token ?? 'mock-token-xyz');
  window.localStorage.setItem('user', JSON.stringify(authUser));
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      seedAuth(options?: SeedAuthOptions): Chainable<void>;
    }
  }
}

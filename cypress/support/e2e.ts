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
  refreshToken?: string;
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
  // A refresh token is required so a stray 401 doesn't take the interceptor's
  // "no refresh token" branch, which clears storage and redirects to /login —
  // a race that makes protected-page specs flaky under slower CI latency.
  window.localStorage.setItem(
    'refreshToken',
    options.refreshToken ?? 'mock-refresh-token',
  );

  // Keep any unmocked 401 from redirecting: the interceptor refreshes, retries
  // once (marked _retry), then rejects without navigating away.
  cy.intercept('POST', '**/auth/refresh**', {
    statusCode: 200,
    body: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      seedAuth(options?: SeedAuthOptions): Chainable<void>;
    }
  }
}

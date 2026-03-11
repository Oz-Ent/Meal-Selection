// Cypress E2E support file
// This file runs before each e2e test

// Disable uncaught exception handling for Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  return false;
});

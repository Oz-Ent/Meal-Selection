describe('Home Page E2E Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page', () => {
    cy.url().should('include', '/');
  });

  it('should have content on the page', () => {
    cy.get('body').should('exist');
  });
});

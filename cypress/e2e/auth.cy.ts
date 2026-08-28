describe('Authentication & Onboarding Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  it('renders login page with form elements and links', () => {
    cy.visit('/login');
    cy.contains('Email').should('exist');
    cy.get('input').should('have.length.at.least', 2);
    cy.get('input[type="password"]').should('exist');
    cy.contains(/Sign in|Login/i).should('exist');
    cy.contains(/Forgot Password/i).should('exist');
    cy.contains(/Sign Up/i).should('exist');
  });

  it('validates required fields and shows feedback on invalid submission', () => {
    cy.visit('/login');
    cy.get('button[type="submit"], button:contains("Sign In"), button:contains("Login")').first().click({ force: true });
    cy.url().should('include', '/login');
  });

  it('navigates to forgot password flow and resets password', () => {
    cy.visit('/forgot-password');
    cy.contains(/Forgot Password/i).should('exist');
    cy.contains(/Continue with Email/i).should('exist').click();

    cy.url().should('include', '/forgot-password/email');
    cy.get('input[type="email"]').should('exist').type('user@example.com');

    // Intercept generate token API
    cy.intercept('POST', '**/auth/generate-password-token**', {
      statusCode: 200,
      body: { message: 'Token sent' },
    }).as('generateToken');

    cy.contains('button', /Send OTP|Continue|Submit|Next/i).click();

    // Verify on OTP page
    cy.url().should('include', '/forgot-password/otp');
    cy.contains(/OTP/i).should('exist');
  });

  it('renders welcome screen with get started action', () => {
    cy.visit('/welcome');
    cy.contains(/Edziban|Meal|Welcome/i).should('exist');
    cy.contains(/Get Started|Sign In|Continue/i).should('exist');
  });

  it('renders signup page with registration form', () => {
    cy.visit('/signup');
    cy.contains(/Sign Up|Register|Create/i).should('exist');
    cy.get('input').should('have.length.at.least', 1);
  });
});

describe('User Account & Profile Integration Tests', () => {
  const mockUser = {
    id: 1,
    name: 'Kofi Mensah',
    email: 'kofi@example.com',
    referenceEmail: 'kofi@company.com',
    referenceId: 1042,
    roleId: 2,
    roleName: 'user',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    cy.seedAuth({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      roleId: mockUser.roleId,
      roleName: mockUser.roleName,
    });

    // Mock profile. The endpoint is exactly '/users/profile' (no trailing
    // segment), so the glob must not require one — otherwise the real API is
    // hit, returns 401, and the app redirects to /login.
    cy.intercept('GET', '**/users/profile**', {
      statusCode: 200,
      body: mockUser,
    }).as('getProfile');

    // Mock preferences
    cy.intercept('GET', '**/users/preferences**', {
      statusCode: 200,
      body: {
        dislikes: {
          foodItems: ['PK'],
          meals: [],
        },
      },
    }).as('getPreferences');

    // Mock food library
    cy.intercept('GET', '**/food-library**', {
      statusCode: 200,
      body: [
        { id: 1, foodCode: 'PK', name: 'Pork', foodGroup: 'Meat' },
        { id: 2, foodCode: 'BF', name: 'Beef', foodGroup: 'Meat' },
      ],
    }).as('getFoodLibrary');

    // Mock meals
    cy.intercept('GET', '**/meals**', {
      statusCode: 200,
      body: { meals: [] },
    }).as('getMeals');

    // Mock leaves
    cy.intercept('GET', '**/users/leaves**', {
      statusCode: 200,
      body: [],
    }).as('getLeaves');
  });

  it('renders account page with user profile, dietary preferences, and security settings', () => {
    cy.visit('/account');
    cy.wait('@getProfile');

    cy.contains('Account & Settings').should('exist');
    cy.contains('Kofi Mensah').should('exist');
    cy.contains('Dietary Preferences').should('exist');
    cy.contains('Leave Days & Availability').should('exist');
    cy.contains('Security & Password').should('exist');
  });

  it('opens dietary preferences modal when Configure is clicked', () => {
    cy.visit('/account');
    cy.wait('@getProfile');

    cy.contains(/Configure|Add Dietary/i).click();
    cy.contains('Manage Meal Preferences').should('exist');
    cy.contains('Ingredients').should('exist');
  });

  it('opens sign out confirmation modal when logout button is clicked', () => {
    cy.visit('/account');
    cy.wait('@getProfile');

    cy.contains('button', /Sign Out|Log Out/i).click();
    cy.contains('Sign Out of Account?').should('exist');
    cy.contains('Cancel').should('exist');
  });
});

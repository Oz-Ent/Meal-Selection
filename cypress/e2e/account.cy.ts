describe('User Account & Profile Integration Tests', () => {
  const mockUser = {
    user: {
      id: 1,
      name: 'Kofi Mensah',
      email: 'kofi@example.com',
      roleId: 2,
      roleName: 'user',
    },
    availability: {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
  };

  const mockProfileResponse = {
    id: 1,
    name: 'Kofi Mensah',
    email: 'kofi@example.com',
    referenceEmail: 'kofi@company.com',
    referenceId: 1042,
    roleId: 2,
    roleName: 'user',
    status: 'ACTIVE',
    leaves: [],
    upcomingOrActiveLeaves: [],
    totalLeaveDays: 0,
    preferences: {
      dislikes: {
        foodItems: ['PK'],
        meals: [],
      },
    },
  };

  beforeEach(() => {
    window.localStorage.setItem('token', 'mock-token-xyz');
    window.localStorage.setItem('refreshToken', 'mock-refresh-xyz');
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    // Mock profile
    cy.intercept('GET', '**/users/profile**', {
      statusCode: 200,
      body: mockProfileResponse,
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

    cy.contains('Account & Settings').should('exist');
    cy.contains('Kofi Mensah').should('exist');
    cy.contains('Dietary Preferences').should('exist');
    cy.contains('Leave Days & Availability').should('exist');
    cy.contains('Security & Password').should('exist');
  });

  it('opens edit modal and displays current user details', () => {
    cy.visit('/account');

    cy.get('button[aria-label="Edit Profile"]').click({ force: true });
    cy.contains('Edit Account Details').should('be.visible');
    cy.get('input[value="Kofi Mensah"]').should('be.disabled');
    cy.get('input[type="email"]').should('have.value', 'kofi@example.com');
  });

  it('validates email format and blocks disposable email addresses with error feedback', () => {
    cy.visit('/account');

    cy.get('button[aria-label="Edit Profile"]').click({ force: true });
    cy.contains('Edit Account Details').should('be.visible');

    const emailInput = cy.get('input[type="email"]');
    
    // Clear and enter invalid email
    emailInput.clear().type('invalid-email');
    cy.contains(/Please enter a valid email address/i).should('be.visible');
    cy.contains('button', /Save Changes/i).should('be.disabled');

    // Enter disposable email
    emailInput.clear().type('kofi@mailinator.com');
    cy.contains(/Disposable \/ temporary email addresses cannot receive notification/i).should('be.visible');
    cy.contains('button', /Save Changes/i).should('be.disabled');
  });

  it('shows typo correction suggestion and auto-applies suggestion on click', () => {
    cy.visit('/account');

    cy.get('button[aria-label="Edit Profile"]').click({ force: true });
    cy.contains('Edit Account Details').should('be.visible');

    const emailInput = cy.get('input[type="email"]');
    emailInput.clear().type('kofi@gmai.com');

    cy.contains(/Did you mean/i).should('be.visible');
    cy.contains('kofi@gmail.com').should('be.visible');

    // Click Apply button
    cy.contains('button', 'Apply').click();
    cy.get('input[type="email"]').should('have.value', 'kofi@gmail.com');
    cy.contains(/Valid email address ready for notifications/i).should('be.visible');
  });

  it('shows progress indicator and submits updated email address successfully', () => {
    // Intercept user update PUT request with artificial delay to verify progress indicator
    cy.intercept('PUT', '**/users/1**', {
      delay: 500,
      statusCode: 200,
      body: {
        ...mockProfileResponse,
        email: 'kofi.updated@example.com',
      },
    }).as('updateUser');

    cy.visit('/account');

    cy.get('button[aria-label="Edit Profile"]').click({ force: true });
    cy.contains('Edit Account Details').should('be.visible');

    const emailInput = cy.get('input[type="email"]');
    emailInput.clear().type('kofi.updated@example.com');

    // Click Save Changes and verify progress indicator / spinner
    const saveButton = cy.contains('button', /Save Changes/i);
    saveButton.should('not.be.disabled').click();

    // Verify loading progress state
    cy.get('.animate-spin').should('exist');

    cy.wait('@updateUser');
    cy.contains('Edit Account Details').should('not.exist');
  });

  it('opens dietary preferences modal when Configure is clicked', () => {
    cy.visit('/account');

    cy.contains(/Configure|Add Dietary/i).click();
    cy.contains('Manage Meal Preferences').should('exist');
    cy.contains('Ingredients').should('exist');
  });

  it('opens sign out confirmation modal when logout button is clicked', () => {
    cy.visit('/account');

    cy.contains('button', /Sign Out|Log Out/i).click();
    cy.contains('Sign Out of Account?').should('exist');
    cy.contains('Cancel').should('exist');
  });
});

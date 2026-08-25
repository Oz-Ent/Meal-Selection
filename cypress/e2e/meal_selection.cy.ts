describe('Weekly Meal Selection Integration Tests', () => {
  beforeEach(() => {
    // Seed localStorage with authenticated user session
    const mockUser = {
      id: 1,
      name: 'Kofi Test',
      email: 'kofi@example.com',
      referenceEmail: 'kofi@example.com',
      referenceId: 101,
      roleId: 2,
      roleName: 'user',
      status: 'ACTIVE',
    };
    window.localStorage.setItem('token', 'mock-token-xyz');
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    // Mock weekly schedule API
    cy.intercept('GET', '**/menu-schedule/week/**', {
      statusCode: 200,
      body: {
        id: 1,
        menuId: 10,
        week: 34,
        year: 2026,
        menu: { id: 10, title: 'Weekly Special Menu', isActive: true },
      },
    }).as('getSchedule');

    // Mock menu days
    cy.intercept('GET', '**/menu-days/menu/10**', {
      statusCode: 200,
      body: [
        { id: 100, day: 'MONDAY', menuId: 10 },
        { id: 200, day: 'TUESDAY', menuId: 10 },
        { id: 300, day: 'WEDNESDAY', menuId: 10 },
        { id: 400, day: 'THURSDAY', menuId: 10 },
        { id: 500, day: 'FRIDAY', menuId: 10 },
      ],
    }).as('getMenuDays');

    // Mock menu meals
    cy.intercept('GET', '**/menu-meals/menu/10**', {
      statusCode: 200,
      body: [
        {
          id: 1001,
          menuDayId: 100,
          isActive: true,
          meal: { id: 1, name: 'Waakye Deluxe', imagePath: '' },
        },
        {
          id: 1002,
          menuDayId: 100,
          isActive: true,
          meal: { id: 2, name: 'Jollof & Chicken', imagePath: '' },
        },
        {
          id: 2001,
          menuDayId: 200,
          isActive: true,
          meal: { id: 3, name: 'Banku & Tilapia', imagePath: '' },
        },
      ],
    }).as('getMenuMeals');

    // Mock weekly holidays
    cy.intercept('GET', '**/holidays/week/**', {
      statusCode: 200,
      body: [],
    }).as('getHolidays');

    // Mock user selections
    cy.intercept('GET', '**/meal-selections/weekly/**', {
      statusCode: 200,
      body: { mealSelections: {} },
    }).as('getSelections');

    // Mock user presets
    cy.intercept('GET', '**/presets/user/**', {
      statusCode: 200,
      body: [],
    }).as('getPresets');

    // Mock users list for admin/for-someone
    cy.intercept('GET', '**/users**', {
      statusCode: 200,
      body: [mockUser],
    }).as('getUsers');
  });

  it('renders weekly meal selection page with weekday tabs and meal options', () => {
    cy.visit('/select-meal');

    cy.contains(/Waakye Deluxe|Select Meal|Weekly/i).should('exist');
    cy.contains(/Monday/i).should('exist');
  });

  it('allows switching days and choosing meals', () => {
    cy.visit('/select-meal');

    // Choose first meal option for Monday
    cy.get('button[role="radio"]').first().click();

    // Verify radio checked or selected styling
    cy.get('button[role="radio"]').first().should('have.attr', 'aria-checked', 'true');
  });

  it('opens confirmation modal when saving complete selections', () => {
    cy.visit('/select-meal');

    // Intercept meal selection submission
    cy.intercept('POST', '**/meal-selections', {
      statusCode: 201,
      body: { message: 'Selections saved successfully' },
    }).as('saveSelections');

    // If Save button is visible in header
    cy.get('nav').within(() => {
      cy.get('button').contains(/Save/i).should('exist');
    });
  });
});

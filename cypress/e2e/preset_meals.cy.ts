describe('Preset Meals Integration Tests', () => {
  const mockUser = {
    id: 1,
    name: 'Kofi Test',
    email: 'kofi@example.com',
    referenceEmail: 'kofi@example.com',
    roleId: 2,
    roleName: 'user',
  };

  beforeEach(() => {
    window.localStorage.setItem('token', 'mock-token-xyz');
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    // Mock menus
    cy.intercept('GET', '**/menus**', {
      statusCode: 200,
      body: [
        { id: 10, title: 'Menu Standard', isActive: true },
        { id: 20, title: 'Menu Vegetarian', isActive: true },
      ],
    }).as('getMenus');

    // Mock presets
    cy.intercept('GET', '**/presets/user/**', {
      statusCode: 200,
      body: [
        {
          id: 101,
          name: 'My Daily Favorites',
          menuId: 10,
          userId: 1,
          isDefault: true,
        },
      ],
    }).as('getPresets');

    // Mock menu details
    cy.intercept('GET', '**/menus/10**', {
      statusCode: 200,
      body: { id: 10, title: 'Menu Standard', isActive: true },
    }).as('getSingleMenu');

    // Mock menu days & meals
    cy.intercept('GET', '**/menu-days/menu/10**', {
      statusCode: 200,
      body: [{ id: 1, day: 'MONDAY', menuId: 10 }],
    }).as('getDays');

    cy.intercept('GET', '**/menu-meals/menu/10**', {
      statusCode: 200,
      body: [
        {
          id: 501,
          menuDayId: 1,
          isActive: true,
          meal: { id: 1, name: 'Waakye Special', imagePath: '' },
        },
      ],
    }).as('getMeals');
  });

  it('renders preset meals dashboard with existing presets and Add button', () => {
    cy.visit('/preset-meals');

    cy.contains('Preset Meals').should('exist');
    cy.contains('My Daily Favorites').should('exist');
    cy.contains(/Default/i).should('exist');
    cy.get('button[aria-label="Add new preset menu"]').should('exist');
  });

  it('opens Select Menu modal on clicking Add', () => {
    cy.visit('/preset-meals');

    cy.get('button[aria-label="Add new preset menu"]').click();
    cy.contains('Select menu').should('exist');
    cy.contains('Menu Standard').should('exist');
  });

  it('navigates to Preset Builder when selecting a menu', () => {
    cy.visit('/preset-meals');

    cy.get('button[aria-label="Add new preset menu"]').click();
    cy.contains('Menu Standard').click();

    cy.url().should('include', '/preset-meals/create/10');
    cy.contains(/Menu Standard|New Preset/i).should('exist');
  });
});

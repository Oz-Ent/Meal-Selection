describe('Preset Meals Integration Tests', () => {
  const mockUser = {
    user: {
      id: 1,
      name: 'Kofi Test',
      email: 'kofi@example.com',
      roleId: 2,
      roleName: 'user',
    },
    availability: {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
  };

  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      win.localStorage.setItem('token', 'mock-token-xyz');
      win.localStorage.setItem('refreshToken', 'mock-refresh-xyz');
      win.localStorage.setItem('user', JSON.stringify(mockUser));
    });
    window.localStorage.setItem('token', 'mock-token-xyz');
    window.localStorage.setItem('refreshToken', 'mock-refresh-xyz');
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    // Mock auth refresh
    cy.intercept('POST', '**/auth/refresh', {
      statusCode: 200,
      body: {
        token: 'mock-refreshed-token',
        refreshToken: 'mock-refresh-xyz',
        user: mockUser,
      },
    }).as('refreshToken');

    // Mock menus list
    cy.intercept('GET', '**/menus', (req) => {
      if (req.url.includes('/days') || req.url.includes('/meals')) {
        req.continue();
        return;
      }
      req.reply({
        statusCode: 200,
        body: [
          { id: 10, title: 'Menu Standard', isActive: true },
          { id: 20, title: 'Menu Vegetarian', isActive: true },
        ],
      });
    }).as('getMenus');

    // Mock presets
    cy.intercept('GET', '**/presets/by-user/**', {
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

    // Mock preset details
    cy.intercept('GET', '**/presets/with-details/**', {
      statusCode: 200,
      body: {
        id: 101,
        name: 'My Daily Favorites',
        menuId: 10,
        userId: 1,
        isDefault: true,
        presetItems: [
          {
            id: 1,
            presetId: 101,
            menuDayId: 1,
            dayMealId: 501,
            menuDay: { id: 1, day: 'MONDAY' },
            dayMeal: {
              id: 501,
              meal: { id: 1, name: 'Waakye Special', imagePath: '' },
            },
          },
        ],
      },
    }).as('getPresetDetails');

    // Mock single menu details
    cy.intercept('GET', '**/menus/10', (req) => {
      if (req.url.includes('/days') || req.url.includes('/meals')) {
        req.continue();
        return;
      }
      req.reply({
        statusCode: 200,
        body: { id: 10, title: 'Menu Standard', isActive: true },
      });
    }).as('getSingleMenu');

    // Mock menu days
    cy.intercept('GET', '**/menus/days/**', {
      statusCode: 200,
      body: [{ id: 1, day: 'MONDAY', menuId: 10 }],
    }).as('getDays');

    // Mock menu meals
    cy.intercept('GET', '**/menus/*/meals**', {
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

    cy.intercept('GET', '**/food-library**', {
      statusCode: 200,
      body: [],
    }).as('getFoodLibrary');

    cy.intercept('GET', '**/meals', (req) => {
      if (req.url.includes('/menus/')) {
        req.continue();
        return;
      }
      req.reply({ statusCode: 200, body: { meals: [] } });
    }).as('getAllMeals');

    cy.intercept('GET', '**/users/preferences**', {
      statusCode: 200,
      body: { dislikes: { foodItems: [], meals: [] } },
    }).as('getPreferences');
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
    cy.contains('Select menu').should('exist');
    cy.get('button').contains('Menu Standard').click({ force: true });

    cy.url().should('include', '/preset-meals/create/10');
    cy.contains(/Menu Standard|New Preset/i).should('exist');
  });
});

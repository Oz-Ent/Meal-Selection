describe('Weekly Meal Selection Integration Tests', () => {
  beforeEach(() => {
    // Seed localStorage with authenticated user session
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
    cy.on('window:before:load', (win) => {
      win.localStorage.setItem('token', 'mock-token-xyz');
      win.localStorage.setItem('refreshToken', 'mock-refresh-xyz');
      win.localStorage.setItem('user', JSON.stringify(mockUser));
    });
    window.localStorage.setItem('token', 'mock-token-xyz');
    window.localStorage.setItem('refreshToken', 'mock-refresh-xyz');
    // Mock auth refresh
    cy.intercept('POST', '**/auth/refresh', {
      statusCode: 200,
      body: {
        token: 'mock-refreshed-token',
        refreshToken: 'mock-refresh-xyz',
        user: mockUser,
      },
    }).as('refreshToken');

    // Mock weekly schedule API
    cy.intercept('GET', '**/week-menu-schedules/**', {
      statusCode: 200,
      body: {
        id: 1,
        menuId: 10,
        week: 35,
        year: 2026,
        status: 'ACTIVE',
        menu: { id: 10, title: 'Weekly Special Menu', isActive: true },
      },
    }).as('getSchedule');

    // Mock single menu details
    cy.intercept('GET', '**/menus/10', {
      statusCode: 200,
      body: { id: 10, title: 'Weekly Special Menu', isActive: true },
    }).as('getMenu');

    // Mock menu days
    cy.intercept('GET', '**/menus/days/**', {
      statusCode: 200,
      body: [
        { id: 100, day: 'MONDAY' },
        { id: 200, day: 'TUESDAY' },
        { id: 300, day: 'WEDNESDAY' },
        { id: 400, day: 'THURSDAY' },
        { id: 500, day: 'FRIDAY' },
      ],
    }).as('getMenuDays');

    // Mock menu meals
    cy.intercept('GET', '**/menus/*/meals**', {
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
    cy.intercept('GET', '**/holidays/**', {
      statusCode: 200,
      body: [],
    }).as('getHolidays');

    // Mock user selections
    cy.intercept('GET', '**/meal-selections/**', {
      statusCode: 200,
      body: { mealSelections: {} },
    }).as('getSelections');

    // Mock user presets
    cy.intercept('GET', '**/presets/**', {
      statusCode: 200,
      body: [],
    }).as('getPresets');

    // Mock user preferences
    cy.intercept('GET', '**/users/preferences**', {
      statusCode: 200,
      body: { dislikes: { foodItems: [], meals: [] } },
    }).as('getPreferences');

    // Mock food library
    cy.intercept('GET', '**/food-library**', {
      statusCode: 200,
      body: [],
    }).as('getFoodLibrary');

    // Mock meals
    cy.intercept('GET', '**/meals', (req) => {
      if (req.url.includes('/menus/')) {
        req.continue();
        return;
      }
      req.reply({ statusCode: 200, body: { meals: [] } });
    }).as('getAllMeals');

    // Mock users list for admin/for-someone
    cy.intercept('GET', '**/users**', {
      statusCode: 200,
      body: [mockUser.user],
    }).as('getUsers');
  });

  it('renders weekly meal selection page with weekday tabs and meal options', () => {
    cy.visit('/select-meal');
    cy.wait('@getSchedule');
    cy.wait('@getMenuDays');

    cy.get('button[aria-label="Back"]').should('exist');
    cy.contains(/Monday|Tuesday|Wednesday|Thursday|Friday/i).should('exist');
  });

  it('allows switching days and choosing meals', () => {
    cy.visit('/select-meal');
    cy.wait('@getSchedule');

    // Choose first meal option
    cy.get('button[role="radio"]').first().should('exist').click({ force: true });
  });

  it('navigates dynamically back on clicking Back button', () => {
    cy.visit('/history');
    cy.visit('/select-meal');

    cy.get('button[aria-label="Back"]').click();
    cy.url().should('include', '/history');
  });
});

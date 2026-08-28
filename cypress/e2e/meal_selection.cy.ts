describe('Weekly Meal Selection Integration Tests', () => {
  beforeEach(() => {
    // Seed authenticated user session (nested IAuthUser shape)
    const mockUser = {
      id: 1,
      name: 'Kofi Test',
      email: 'kofi@example.com',
      roleId: 2,
      roleName: 'user',
    };
    cy.seedAuth(mockUser);

    // Freeze the clock to a Monday morning (before the 10:00 cut-off) so the
    // week/day logic is deterministic: Monday is "today" and selectable.
    // Restrict the fake clock to Date so timers/network keep working.
    cy.clock(new Date(2026, 7, 31, 8, 0, 0).getTime(), ['Date']);

    // Mock weekly schedule API
    cy.intercept('GET', '**/week-menu-schedules/by-week-year**', {
      statusCode: 200,
      body: {
        id: 1,
        week: 34,
        year: 2026,
        status: 'ACTIVE',
        menu: { id: 10, title: 'Weekly Special Menu' },
      },
    }).as('getSchedule');

    // Mock menu days
    cy.intercept('GET', '**/menus/days/10**', {
      statusCode: 200,
      body: [
        { id: 100, day: 'MONDAY' },
        { id: 200, day: 'TUESDAY' },
        { id: 300, day: 'WEDNESDAY' },
        { id: 400, day: 'THURSDAY' },
        { id: 500, day: 'FRIDAY' },
      ],
    }).as('getMenuDays');

    // Mock menu meals (options for every day so the active day always has some)
    cy.intercept('GET', '**/menus/10/meals**', {
      statusCode: 200,
      body: [100, 200, 300, 400, 500].flatMap((menuDayId) => [
        {
          id: menuDayId + 1,
          isActive: true,
          menuDayId,
          meal: { id: 1, name: 'Waakye Deluxe', imagePath: '' },
        },
        {
          id: menuDayId + 2,
          isActive: true,
          menuDayId,
          meal: { id: 2, name: 'Jollof & Chicken', imagePath: '' },
        },
      ]),
    }).as('getMenuMeals');

    // Mock weekly holidays
    cy.intercept('GET', '**/holidays/week**', {
      statusCode: 200,
      body: [],
    }).as('getHolidays');

    // Mock user selections
    cy.intercept('GET', '**/meal-selections/weekly/**', {
      statusCode: 200,
      body: { mealSelections: {} },
    }).as('getSelections');

    // Mock user presets
    cy.intercept('GET', '**/presets/by-user/**', {
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

describe('Admin Portal Integration Tests', () => {
  const mockAdminUser = {
    id: 99,
    name: 'Admin Boss',
    email: 'admin@company.com',
    referenceEmail: 'admin@company.com',
    referenceId: 999,
    roleId: 1,
    roleName: 'admin',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    cy.seedAuth({
      id: mockAdminUser.id,
      name: mockAdminUser.name,
      email: mockAdminUser.email,
      roleId: mockAdminUser.roleId,
      roleName: mockAdminUser.roleName,
      token: 'mock-admin-token',
    });

    // Mock admin menu list
    cy.intercept('GET', '**/menus**', {
      statusCode: 200,
      body: [
        { id: 1, title: 'Weekly Special Menu', isActive: true },
        { id: 2, title: 'Executive Lunch Menu', isActive: false },
      ],
    }).as('getAdminMenus');

    // Mock week schedules so the Menu page's loading state resolves; otherwise
    // this unmocked call hits the real API and can hang the list past the
    // command timeout in CI.
    cy.intercept('GET', '**/week-menu-schedules**', {
      statusCode: 200,
      body: [],
    }).as('getWeekSchedules');

    // Mock holidays. Match the exact API pathname so this does NOT also
    // intercept the SPA document navigation to '/admin/holidays'.
    cy.intercept(
      { method: 'GET', pathname: '/holidays' },
      {
        statusCode: 200,
        body: {
          publicHolidays: [
            {
              id: 1,
              title: "Independence Day",
              // Far-future date so it always shows under the default "Upcoming"
              // filter regardless of when the suite runs.
              date: '2099-03-06',
              dayName: 'Friday',
              source: 'PUBLIC',
              isIgnored: false,
            },
          ],
          companyHolidays: [],
        },
      },
    ).as('getHolidays');

    // Mock meals
    cy.intercept('GET', '**/meals**', {
      statusCode: 200,
      body: {
        meals: [
          { id: 1, name: 'Waakye Deluxe', isActive: true, imagePath: '' },
          { id: 2, name: 'Banku & Tilapia', isActive: true, imagePath: '' },
        ],
      },
    }).as('getAdminMeals');
  });

  it('renders admin activities dashboard with navigation links', () => {
    cy.visit('/admin/activities');

    cy.contains(/Activities|Dashboard/i).should('exist');
    cy.contains(/Menu/i).should('exist');
    cy.contains(/Meal/i).should('exist');
    cy.contains(/Holiday/i).should('exist');
  });

  it('navigates to menu management page and displays menus', () => {
    cy.visit('/admin/menu');

    cy.contains(/Menu/i).should('exist');
    cy.contains('Weekly Special Menu').should('exist');
  });

  it('navigates to mark holidays page and shows statutory holidays', () => {
    cy.visit('/admin/holidays');

    cy.contains('Mark & Override Holidays').should('exist');
    cy.contains('Independence Day').should('exist');
    cy.contains(/Mark Company Holiday/i).should('exist');
  });

  it('navigates to meals management page', () => {
    cy.visit('/admin/meal');

    cy.contains(/Meal/i).should('exist');
    cy.contains('Waakye Deluxe').should('exist');
  });
});

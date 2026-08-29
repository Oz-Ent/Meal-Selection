describe('Admin Portal Integration Tests', () => {
  const mockAdminUser = {
    user: {
      id: 99,
      name: 'Admin Boss',
      email: 'admin@company.com',
      roleId: 1,
      roleName: 'admin',
    },
    availability: {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
  };

  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      win.localStorage.setItem('token', 'mock-admin-token');
      win.localStorage.setItem('refreshToken', 'mock-admin-refresh');
      win.localStorage.setItem('user', JSON.stringify(mockAdminUser));
    });
    window.localStorage.setItem('token', 'mock-admin-token');
    window.localStorage.setItem('refreshToken', 'mock-admin-refresh');
    window.localStorage.setItem('user', JSON.stringify(mockAdminUser));

    // Mock admin menu list
    cy.intercept('GET', '**/menus', {
      statusCode: 200,
      body: [
        { id: 1, title: 'Weekly Special Menu', isActive: true },
        { id: 2, title: 'Executive Lunch Menu', isActive: false },
      ],
    }).as('getAdminMenus');

    // Mock week schedules
    cy.intercept('GET', '**/week-menu-schedules**', {
      statusCode: 200,
      body: [],
    }).as('getWeekSchedules');

    // Mock holidays API without intercepting /admin/holidays navigation
    cy.intercept('GET', '**/holidays**', (req) => {
      if (req.url.includes('localhost:5173')) {
        req.continue();
        return;
      }
      req.reply({
        statusCode: 200,
        body: {
          publicHolidays: [
            {
              id: 1,
              title: "Independence Day",
              date: '2026-12-25',
              dayName: 'Friday',
              source: 'PUBLIC',
              isIgnored: false,
            },
          ],
          companyHolidays: [],
        },
      });
    }).as('getHolidays');

    // Mock weekly holidays
    cy.intercept('GET', '**/holidays/week/**', {
      statusCode: 200,
      body: [],
    }).as('getWeeklyHolidays');

    // Mock food library
    cy.intercept('GET', '**/food-library**', {
      statusCode: 200,
      body: [],
    }).as('getFoodLibrary');

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

  it('navigates to meals management page and returns on clicking back button', () => {
    cy.visit('/admin/activities');
    cy.visit('/admin/meal');
    cy.contains('Waakye Deluxe').should('exist');

    // Click back button to dynamically return to admin activities
    cy.get('button[aria-label="Back"]').click();
    cy.url().should('include', '/admin/activities');
  });
});

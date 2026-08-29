describe('History & Activities Integration Tests', () => {
  const mockUser = {
    id: 1,
    name: 'Kofi Mensah',
    email: 'kofi@example.com',
    referenceEmail: 'kofi@company.com',
    roleId: 2,
    roleName: 'user',
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

    // Mock weekly selections history
    cy.intercept('GET', '**/meal-selections/user/**', {
      statusCode: 200,
      body: [],
    }).as('getUserHistory');

    // Mock active menu schedule
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
  });

  it('renders user activities dashboard with action cards', () => {
    cy.visit('/activities');

    cy.contains(/Select Meal|Weekly Meal|Activities/i).should('exist');
    cy.contains(/History/i).should('exist');
    cy.contains(/Preset/i).should('exist');
  });

  it('navigates to meal history page', () => {
    cy.visit('/history');

    cy.contains(/History|Past Meals/i).should('exist');
  });
});

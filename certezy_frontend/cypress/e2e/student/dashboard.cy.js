describe('Student Dashboard & Logout Flow', () => {

  beforeEach(() => {

    cy.visit('/login')

    cy.fixture('testUser.json').then((user) => {
      cy.login(user.email, user.password)
    })

    cy.url().should('include','/student/dashboard')

  })


  it('should render the student dashboard with sidebar layout properly', () => {

    cy.get('aside').should('be.visible')

    cy.get('aside').contains('Dashboard')

    cy.get('aside').contains('My Courses')

  })


  it('should allow the student to logout successfully', () => {

    cy.intercept('POST','**/auth/logout').as('logoutApi')

    cy.logout()

    cy.url().should('include','/login')

  })

})
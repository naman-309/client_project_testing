describe('User Registration Flow', () => {

  beforeEach(() => {
    cy.intercept('POST', '**/auth/register').as('registerApi')
    cy.visit('/register')
  })


  it('should display validation errors on empty submission', () => {

    cy.get('button[type="submit"]').click()

    cy.contains(/name/i).should('exist')
    cy.contains(/email/i).should('exist')
    cy.contains(/password/i).should('exist')

  })


  it('should successfully register a new user', () => {

    const email = `test_${Date.now()}@example.com`
    const password = 'Password@123'

    cy.get('input[name="name"]').type('Test User')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('input[name="confirmPassword"]').type(password)

    cy.get('button[type="submit"]').click()

    cy.wait('@registerApi').its('response.statusCode').should('be.oneOf',[200,201])

    // Save newly created local test user credentials to fixture file
    cy.writeFile('cypress/fixtures/testUser.json', { email, password })

    // Since app auto-login skips /login page, assert that we left register page
    cy.url().should('not.include', '/register')

  })

})
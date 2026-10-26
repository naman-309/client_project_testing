describe('Courses Browsing Flow', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/courses**').as('fetchCourses')
    cy.visit('/courses')
  })


  it('should load courses listing page successfully', () => {

    cy.wait('@fetchCourses').its('response.statusCode').should('eq',200)

    cy.contains(/courses/i).should('be.visible')

    cy.get('body').should('contain','Course')

  })


  it('should be able to search for a course', () => {

    cy.get('input[type="search"], input[placeholder*="search" i]')
      .first()
      .type('AWS{enter}')

    cy.wait('@fetchCourses')

    cy.get('body').should('contain','AWS')

  })


  it('should navigate to course detail page when clicking a course card', () => {

    cy.wait('@fetchCourses')

    cy.get('a[href*="/courses"]').first().click()

    cy.url().should('include','/courses')

  })

})
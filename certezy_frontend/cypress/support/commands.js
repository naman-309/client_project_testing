Cypress.Commands.add('login',(email,password)=>{

  cy.get('input[name="email"],input[type="email"]').type(email)

  cy.get('input[name="password"],input[type="password"]').type(password)

  cy.get('button[type="submit"]').click()

})

Cypress.Commands.add('logout',()=>{

  cy.contains('button','Logout').click()

})
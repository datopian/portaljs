describe('Test Search Page', () => {
  beforeEach(() => {
    cy.visit('/search');
  });

  it('has a search form', () => {
    cy.contains('form');
    cy.contains('Search');
  });

  // it('should return a search result', () => {
  //   cy.get('form').find('[type="text"]').type('gdp');
  //   cy.get('form').submit();
  //   cy.url().should('include', 'search?q=gdp&sort=');
  //   cy.get('.text-3xl').should('have.text', '1 results found');
  //   cy.get('.text-xl > .text-primary').should(
  //     'have.text',
  //     'Country, Regional and World GDP (Gross Domestic Product)'
  //   );
  // });
});

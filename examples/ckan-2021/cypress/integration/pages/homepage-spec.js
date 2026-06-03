describe('Test Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the hero title', () => {
    cy.contains('Find and Share');
  });

  it('checks that a search form exists', () => {
    cy.get('form').contains('Search');
  });

  // it('submits the search form', () => {
  //   cy.get('form').find('[type="text"]').type('gdp');
  //   cy.get('form').submit();
  //   cy.url().should('include', '/search?q=gdp&sort=');
  //   cy.get('.text-3xl').and('contain.text', '1 results found');
  // });

  it('shows the recent datasets', () => {
    cy.contains('Recent Datasets');
  });

  it('returns the expected number of recent datasets', () => {
    cy.get('.recent')
      .find('div')
      .should(($div) => {
        expect($div).to.have.length.of.at.least(2);
      });
  });
});

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Displays the total search result
 * @param {object} props 
 * {
 *  count: The total number of search results
 * } 
 * @returns React Component
 */
const Total = ({ count }) => {

  return (
    <h1 className="text-3xl font-semibold text-primary my-6 inline-block">
      {count} results found
    </h1>
  );
};

Total.propTypes = {
  count: PropTypes.number.isRequired
}

export default Total;

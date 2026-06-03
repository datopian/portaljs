import React from 'react'
import PropTypes from 'prop-types';

/**
 * Error message component with consistent portal style
 * @param {object} props 
 * {
 *  message: The error message to display
 * } 
 * @returns 
 */
const ErrorMessage = ({ message }) => {
  return (
    <aside>
      {message}
      <style jsx>{`
        aside {
          padding: 1.5em;
          font-size: 14px;
          color: white;
          background-color: red;
        }
      `}</style>
    </aside>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired
}

export default ErrorMessage;

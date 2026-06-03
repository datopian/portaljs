import React from 'react'
import PropTypes from 'prop-types';

/**
 * Creates a custom link with title
 * @param {object} props 
 * {
 *  url: The url of the custom link
 *  title: The title for the custom link
 * } 
 * @returns React Component
 */
const CustomLink = ({ url, title }) => (
  <a
    href={url}
    className="bg-white hover:bg-gray-200 border text-black font-semibold py-2 px-4 rounded"
  >
    {title}
  </a>
);

CustomLink.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
}

export default CustomLink;

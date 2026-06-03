import React, { useState } from 'react'
import PropTypes from 'prop-types';

/**
 * Search component form that can be customized with change and submit handlers
 * @param {object} props
 * {
 *  handleChange: A form input change event handler. This function is executed when the
 *                search input or order by input changes.
 *  handleSubmit: A form submit event handler. This function is executed when the
 *                search form is submitted.
 * } 
 * @returns 
 */
const Form = ({ handleSubmit }) => {
  const [searchQuery, setSearchQuery] = useState("")
  return (
    <form onSubmit={(e) => e.preventDefault()} className="items-center">
      <div className="flex">
        <input
          type="text"
          name="search#q"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value) }}
          placeholder="Search"
          aria-label="Search"
          className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 w-1/2 rounded-lg py-2 px-4 block appearance-none leading-normal"
        />
        <button
          onClick={() => handleSubmit(searchQuery)}
          type="button"
          className="inline-block text-sm px-4 py-3 mx-3 leading-none border rounded text-white bg-black border-black lg:mt-0"
        >
          Search
        </button>
      </div>
    </form>
  );
};

Form.propTypes = {
  handleSubmit: PropTypes.func.isRequired
}

export default Form;

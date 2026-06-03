import React from 'react'
import Link from 'next/link';
import PropTypes from 'prop-types';

/**
 * Single item from a search result showing info about a dataset.
 * @param {object} props data package with the following format:
 * {
 *  organization: {name: <some name>, title: <some title> },
 *  title: <Data package title>
 *  name:  <Data package name>
 *  description: <description of data package>
 *  notes: <Notes associated with the data package>
 * }
 * @returns React Component
 */
const Item = ({ dataset }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold">
        <Link
          href={`/@${
            dataset.organization
              ? dataset.organization.name
              : 'dataset'
          }/${dataset.name}`}
        >
          <a className="text-primary">
            {dataset.title || dataset.name}
          </a>
        </Link>
      </h3>
      <Link
        href={`/@${
          dataset.organization ? dataset.organization.name : 'dataset'
        }`}
      >
        <a className="text-gray-500 block mt-1">
          {dataset.organization
            ? dataset.organization.title
            : 'dataset'}
        </a>
      </Link>
      <div className="leading-relaxed mt-2">
        {dataset.description || dataset.notes}
      </div>
    </div>
  );
};

Item.propTypes = {
  dataset: PropTypes.object.isRequired
}

export default Item;

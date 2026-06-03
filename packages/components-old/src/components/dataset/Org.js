import Link from 'next/link';
import React from 'react'
import PropTypes from 'prop-types';

/**
 * Displays information about an organization in a dataset page
 * @param {Object} props object describing the dataset organization. 
 * organization: {
 *   image_url: The image url of the organization
 *   name: The name of the organization
 *   title: The title of the organization
 * } 
 * @returns 
 */
const Org = ({ organization }) => {
  return (
    <>
      {organization ? (
        <>
          <img
            src={
              organization.image_url ||
              'https://datahub.io/static/img/datahub-cube-edited.svg'
            }
            className="h-5 w-5 mr-2 inline-block"
            alt="org_img"
          />
          <Link href={`/@${organization.name}`}>
            <a className="font-semibold text-primary underline">
              {organization.title || organization.name}
            </a>
          </Link>
        </>
      ) : (
        ''
      )}
    </>
  );
};

Org.propTypes = {
  organization: PropTypes.object.isRequired
}

export default Org;

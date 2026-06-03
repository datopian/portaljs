import React from 'react';
import PropTypes from 'prop-types';

/**
 * ReadMe component displays the markdown description of a datapackage
 * @param {string} readme parsed html of data package readme
 * @returns React Component
 */
const ReadMe = ({ readme }) => {
    return (
        <>
            <section className="m-8" name="sample-table">
                <div className="prose">
                    <div dangerouslySetInnerHTML={{ __html: readme }} />
                </div>
            </section>
        </>
    )
}

ReadMe.propTypes = {
    readme: PropTypes.string.isRequired
}

export default ReadMe
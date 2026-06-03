import React from 'react';
import filesize from 'filesize'
import * as timeago from 'timeago.js';
import PropTypes from 'prop-types';

/**
 * KeyInfo component receives two arguments.
 * @param {Object} descriptor A Frictionless datapackage descriptor object with the following fields
 * @param {Array} resources A Frictionless datapackage resource array
 * @returns React Component
 */
const KeyInfo = ({ descriptor, resources }) => {
    const formats = resources.map(item => item.format).join(', ');

    return (
        <>
            <section className="m-8" name="key-info" id="key-info">
                <h2 className="text-xl font-bold mb-4">Key info</h2>
                <div className="grid grid-cols-7 gap-4">
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Files</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Size</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Format</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Created</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Updated</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Licenses</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Sources</h3>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                    <div>
                        <h3 className="text-1xl">{resources.length}</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl">{descriptor.size || 'N/A'}</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl">{formats}</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl">{descriptor.created && timeago.format(descriptor.created)}</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl">{descriptor.updated && timeago.format(descriptor.updated)}</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl">{
                          descriptor.licenses?.length && (descriptor.licenses.map((item, index) => (
                            <a className="text-yellow-600"
                              href={item.path || '#'} title={item.title || ''}
                              key={index}>
                                {item.name}
                            </a>
                          )))
                        }</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl">{
                          descriptor.sources?.length && (descriptor.sources.map((item, index) => (
                            <a className="text-yellow-600" href={item.path} key={index}>
                              {item.title}
                            </a>
                          )))
                        }</h3>
                    </div>
                </div>
            </section>

        </>
    )
}

KeyInfo.propTypes = {
    descriptor: PropTypes.object.isRequired,
    resources: PropTypes.array.isRequired
}
export default KeyInfo
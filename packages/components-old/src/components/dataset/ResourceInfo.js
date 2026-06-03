import React from 'react';
import filesize from 'filesize'
import * as timeago from 'timeago.js';
import PropTypes from 'prop-types';

/**
 * ResourceInfo component displays all resources in a data package 
 * @param {Array} resources A Frictionless datapackage resource object
 * @returns React Component
 */
const ResourcesInfo = ({ resources }) => {
    return (
        <>
            <section className="m-8" name="file-list">
                <div className="grid grid-cols-7 gap-4">
                    <div>
                        <h3 className="text-1xl font-bold mb-2">File</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Description</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Size</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Created</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Updated</h3>
                    </div>
                    <div>
                        <h3 className="text-1xl font-bold mb-2">Download</h3>
                    </div>
                </div>

                {resources.map((resource, index) => {
                    return (
                        <div key={`${index}_${resource.name}`} className="grid grid-cols-7 gap-4">
                            <div>
                                <h3 className="text-1xl">{resource.title || resource.name}</h3>
                            </div>
                            <div>
                                <h3 className="text-1xl">{resource.description || "No description"}</h3>
                            </div>
                            <div>
                                <h3 className="text-1xl">{resource.size ? filesize(resource.size, { bits: true }) : 0}</h3>
                            </div>
                            <div>
                                <h3 className="text-1xl">{resource.created && timeago.format(resource.created)}</h3>
                            </div>
                            <div>
                                <h3 className="text-1xl">{resource.updated && timeago.format(resource.updated)}</h3>
                            </div>
                            <div>
                                <h3 className="text-1xl">
                                    {/* We assume that resource.path is a URL but not relative path. */}
                                    <a className="text-yellow-600" href={resource.path}>
                                        {resource.format}
                                    </a>
                                </h3>
                            </div>
                        </div>
                    )
                })}
            </section>
        </>
    )
}


ResourcesInfo.propTypes = {
    resources: PropTypes.array.isRequired
}
export default ResourcesInfo
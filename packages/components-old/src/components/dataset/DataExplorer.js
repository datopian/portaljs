import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { useState } from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';

/**
 * Opens a frictionless resource in data explorer. Data explorer gives you
 * an interface to interact with a resource. That means you can do things like 
 * data filtering, sorting, e.t.c
 * @param resources: A array of frictionless datapackage resource
 */
const DataExplorer = ({ resources, columnHeaderStyle }) => {
    const [activeTable, setActiveTable] = useState(0);
    const [previewMode, setPreviewMode] = useState(true);

    const handleTableNameClick = (index) => {
        setActiveTable(index);
    }

    const getDataGridTable = (resource, columnHeaderStyle) => {
        return (
            <DataGrid
                sx={{
                    '& .table-column-header-style-class': {
                        backgroundColor: '#f5f5f5',
                        color: 'black',
                        ...columnHeaderStyle,
                    },
                }}
                key={resource.name}
                columns={generateColumns(resource)}
                rows={prepareRows(resource)}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />
        )
    }

    const getDataGridSchema = (resource, columnHeaderStyle) => {
        return (
            <DataGrid
                sx={{
                    '& .table-column-header-style-class': {
                        backgroundColor: '#f5f5f5',
                        color: 'black',
                        ...columnHeaderStyle,
                    },
                }}
                key={resource.name}
                columns={generateSchemaColumns(resource)}
                rows={prepareSchemaRows(resource)}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />
        )
    }

    return (
        <div className='grid grid-cols-12'  >
            <div className='col-span-3'>
                <div className='flex'>
                    <FolderIcon />
                    <h1 className="font-bold ml-3">
                        Files
                    </h1>
                </div>
                <div className='flex-col'>
                    {
                        resources.map((resource, i) => {
                            return (
                                <div key={`res@${i}`} className='flex'>
                                    <InsertDriveFileIcon className='ml-2' />
                                    <button className='ml-3 focus:outline-none' id={i} onClick={() => handleTableNameClick(i)}>
                                        {
                                            i === activeTable ? (
                                                <h3>{resource.name}.{resource.format}</h3>
                                            ) : (
                                                <h3 className='text-gray-400'>{resource.name}.{resource.format}</h3>
                                            )
                                        }

                                    </button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className='col-span-9 border-2'>
                <h1 className='font-bold ml-3 mb-2 capitalize'>{resources[activeTable].name}</h1>
                <div className='flex'>
                    <div className='flex mr-3'>
                        <a href={resources[activeTable].path} >
                            <FileDownloadIcon className='ml-2' />
                        </a>
                        <span>
                            {resources[activeTable].size ? (formatResourceSize(resources[activeTable].size)) : 'N/A'}
                        </span>
                    </div>
                    <div className='mr-3 text-gray-500'>
                        |
                    </div>
                    <div className='flex mr-3'>
                        <span>
                            {resources[activeTable].sample.length} rows
                        </span>
                    </div>
                    <div className='mr-3 text-gray-500'>
                        |
                    </div>
                    <div className='flex mr-3'>
                        <span>
                            {resources[activeTable].schema.fields.length} columns
                        </span>
                    </div>
                </div>
                <div className='flex mt-5 mb-4'>
                    <button
                        className={`${previewMode && 'font-bold underline'} ml-3 mr-5 focus:outline-none`}
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        Preview
                    </button>
                    <button
                        className={`${!previewMode && 'font-bold underline'} ml-3 mr-5 focus:outline-none`}
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        Table Schema
                    </button>
                </div>
                {
                    previewMode && (
                        <div className='ml-3' style={{ height: "370px" }}>
                            {getDataGridTable(resources[activeTable], columnHeaderStyle)}
                        </div>
                    )
                }
                {
                    !previewMode && (
                        <div className='ml-3' style={{ height: "370px" }}>
                            {getDataGridSchema(resources[activeTable], columnHeaderStyle)}
                        </div>
                    )
                }
            </div>

        </div>
    );
}


const generateColumns = (resource) => {
    return resource.schema?.fields.map((field) => {
        return {
            field: field.name,
            headerName: field.name,
            width: 150,
            description: field.description,
            headerClassName: 'table-column-header-style-class',
        }
    });
}

const prepareRows = (resource) => {
    return resource.sample.map((row, i) => {
        row['id'] = i
        return row
    })
}

const generateSchemaColumns = () => {
    return [
        {
            field: "name",
            headerName: "Field",
            flex: 0.5,
            description: "Field name",
            headerClassName: 'table-column-header-style-class',
        },
        {
            field: "type",
            headerName: "Type",
            width: 150,
            description: "Field type",
            headerClassName: 'table-column-header-style-class',
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            description: "Field description",
            headerClassName: 'table-column-header-style-class',
        }
    ]
}

const prepareSchemaRows = (resource) => {
    return resource.schema?.fields.map((field, i) => {
        field['id'] = i
        return field
    });
}

const formatResourceSize = (bytes) => {
    if (bytes < 1024) {
        return bytes + ' b';
    } else if (bytes < 1048576) {
        return (bytes / 1024).toFixed(2) + ' kb';
    } else if (bytes < 1073741824) {
        return (bytes / 1048576).toFixed(2) + ' mb';
    } else {
        return bytes
    }
}



DataExplorer.propTypes = {
    resources: PropTypes.array.isRequired,
}

export default DataExplorer




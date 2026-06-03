import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

/**
 * Displays dataset in tabular form using data grid
 * @param columns: An array of column names with properties: e.g [{field: "col1", headerName: "col1"}, {field: "col2", headerName: "col2"}]
 * @param data: an array of data objects e.g. [ {col1: 1, col2: 2}, {col1: 5, col2: 7} ]
 */
const Table = ({ columns, data, height, width }) => {
  let rows = [...data,]
  rows = rows.map((row, i) => {
    row['id'] = i
    return row
  })
  return (
    <div style={{ height, width }} data-testid="tableGrid">
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired
}

export default Table

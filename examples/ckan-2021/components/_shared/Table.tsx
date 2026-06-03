interface TableProps {
  columns: Array<any>;
  data: Array<any>;
  className?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, className }) => {
  return (
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table
            className={`min-w-full divide-y divide-gray-200 ${className}`}
          >
            <thead className="bg-gray-50">
              <tr>
                {columns.map(({ key, name }) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id}>
                  {columns.map(({ key, render }) => (
                    <td
                      key={key}
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    >
                      {(render &&
                        typeof render === 'function' &&
                        render(item)) ||
                        item[key] ||
                        ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;

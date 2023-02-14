import React from 'react'
import {useTable} from 'react-table'

function Tablecomponent({columns, data}) {

  // Use the useTable Hook to send the columns and data to build the table
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow // Prepare the row (this function needs to be called for each row before getting the row props)
  } = useTable({
    columns,
    data
  });

  return (
    <table className='min-w-full divide-y divide-gray-300'>
      <thead  className='bg-zinc-100 text-zinc-800 text-md' {...getTableProps()}>
        {headerGroups.map(headerGroup => (
          // eslint-disable-next-line react/jsx-key
          <tr className='text-teal-900 text-sm' {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              // eslint-disable-next-line react/jsx-key
              <th 
              scope="col"
              className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" 
              {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="bg-white divide-y divide-gray-200" {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                // eslint-disable-next-line react/jsx-key
                
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}
                className="px-6 py-4 text-xs text-zinc-600  whitespace-nowrap">{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Tablecomponent
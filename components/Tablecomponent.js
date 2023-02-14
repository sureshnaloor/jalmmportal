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
    <table className='w-full'>
      <thead  {...getTableProps()}>
        {headerGroups.map(headerGroup => (
          // eslint-disable-next-line react/jsx-key
          <tr className='text-teal-900 text-sm' {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              // eslint-disable-next-line react/jsx-key
              <th  {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr className='text-red-900 text-xs'{...row.getRowProps()}>
              {row.cells.map(cell => {
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Tablecomponent
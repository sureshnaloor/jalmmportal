import React, { useState } from "react";
import moment from "moment";

import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useFilters,
  useSortBy,
} from "react-table";

// global filter function (search)

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <label className="flex gap-x-2 items-baseline">
      <span className="text-red-500 text-[16px] font-medium pb-3 mb-3">
        {" "}
        Search
      </span>

      <input
        type="text"
        className="mt-1 px-9 block text-sm w-9/12 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`search in ${count} records`}
      />
    </label>
  );
}

// function column filters

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <label className="flex gap-x-3 items-baseline">
      <span className="text-red-500 text-sm font-bold uppercase">
        {render("Header")}:{" "}
      </span>
      <select
        className="mt-1 p-2 text-[10px] w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="" className="text-blue-900 font-bold text-[10px]">
          All
        </option>
        {options.map((option, i) => (
          <option key={i} value={option} className="text-red-900 text-[10px]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

// function styling individual cells

// first a utility function
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Mattype({ value }) {
  const type = value ? value.toUpperCase() : "unknown";

  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-[10px] rounded-full shadow-sm",
        value.startsWith("ZMEC") ? "bg-green-100 text-green-700" : null,
        value.startsWith("ZELC") ? "bg-yellow-100 text-yellow-700" : null,
        value.startsWith("ZCVL") ? "bg-red-100 text-red-700" : null,
        value.startsWith("UNBW") ? "bg-blue-100 text-blue-700" : null,
        value.startsWith("ZINS") ? "bg-zinc-100 text-zinc-700" : null,
        value.startsWith("ZOFC") ? "bg-purple-100 text-purple-700" : null,
        value.startsWith("ZCHN") ? "bg-sky-100 text-sky-700" : null
      )}
    >
      {value}
    </span>
  );
}

// function to apply styliing to individual cells of user

export function Cellstyle({ value }) {
  return (
    <span
      className={classNames(
        "px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm bg-slate-300 text-slate-900"
      )}
    >
      {value}
    </span>
  );
}

// function to apply date format
export function Datestyle({ value }) {
  return (
    <span className={classNames("px-3 py-1 text-indigo-900")}>
      {moment(value).fromNow()}
    </span>
  );
}

export function Numberstyle({ value }) {
  return (
    <span className={classNames("px-3 text-yellow-900 text-[14px] font-bold py-1 text-copper-900  tracking-wider")}>
    
     {( Math.round(value * 100) / 100).toLocaleString("en-US", {style:"currency", currency:"SAR"})}
    </span>
  );
}

export function Numberstylesim1({ value }) {
  return (
    <span className={classNames(" text-yellow-900 text-[12px] font-bold  text-copper-900 shadow-md shadow-stone-600")}>
    
     {( Math.round(value * 100) / 100).toLocaleString("en-US", {style:"currency", currency:"SAR"})}
    </span>
  );
}

export function Numberstylesim({ value }) {
  return (
    <span className={classNames(" text-yellow-900 text-[12px] font-bold  text-copper-900 shadow-md shadow-stone-600")}>
      {value}
     
    </span>
  );
}

export function simStyle({ value }) {
  return (
    <span className={classNames(" text-stone-900 text-[12px] font-bold tracking-wider")}>
      {value}
     
    </span>
  );
}

export function simStyle1({ value }) {
  return (
    <span className={classNames(" text-zinc-900 text-[12px] font-semibold tracking-wide")}>
      {value}
     
    </span>
  );
}
export function simStyle2({ value }) {
  return (
    <span className={classNames(" text-emerald-900 text-[12px] font-bold tracking-wide text-right")}>
      {value}
     
    </span>
  );
}
export function simStyle3({ value }) {
  return (
    <span className={classNames(" text-sky-900 text-[12px] font-bold tracking-wider right-0")}>
      {value}
     
    </span>
  );
}

// function to apply bold and color

export function Boldstyle1({ value }) {
  return (
    <span className={classNames("px-3 py-1 text-zinc-900 font-bold text-[12px]")}>
      {value}
    </span>
  );
}

export function Boldstyle2({ value }) {
  return (
    <span
      className={classNames(
        "px-3 py-1 text-zinc-800 font-bold border-sm border-zinc-900 text-[12px] tracking-wide "
      )}
    >
      {value}
    </span>
  );
}

export function Boldstylesim({ value }) {
  return (
    <span
      className={classNames(
        "text-zinc-800 font-bold text-[13px] p-1 shadow-md shadow-zinc-400"
      )}
    >
      {value}
    </span>
  );
}

export function Boldstylesim1({ value }) {
  return (
    <span
      className={classNames(
        "text-teal-900 font-black shadow-md shadow-cyan-800 px-1 py-1 text-[12px]   "
      )}
    >
      {value}
    </span>
  );
}

export function Normalstylesim({ value }) {
  return (
    <span
      className={classNames(
        "text-teal-900 text-[14px] bg-white p-1 font-bold shadow-md shadow-white"
      )}
    >
      {value}
    </span>
  );
}

export function Specialstylesim({ value }) {
  return (
    <span
      className={classNames(
        " text-white bg-cyan-800 px-2 py-1 shadow-md shadow-cyan-400 font-semibold text-[12px] tracking-tighter  "
      )}
    >
      {value}
    </span>
  );
}

export function Spstylesim({ value }) {
  return (
    <span
      className={classNames(
        " text-white bg-teal-600 px-2 py-1 tracking-tight font-semibold text-[12px]  "
      )}
    >
      {value}
    </span>
  );
}

export function Normalstylesim1({ value }) {
  return (
    <span
      className={classNames(
        "text-blue-900 font-semibold text-[12px] tracking-tight "
      )}
    >
      {value}
    </span>
  );
}
export function Boldstyle3({ value }) {
  return (
    <span
      className={classNames(
        "px-2 py-1 text-sky-800 bg-sky-50 font-bold text-[12px] tracking-wider"
      )}
    >
      {value}
    </span>
  );
}

export function Boldstyle4({ value }) {
  return (
    <span
      className={classNames(
        "px-3 py-1 text-green-800 bg-sky-50 font-bold text-[14px] tracking-widest"
      )}
    >
      {value}
    </span>
  );
}

// svg files for sort icon
export function SortIcon({ className }) {
  return (
    <svg
      className={className}
      stroke="red"
      fill="red"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path>
    </svg>
  );
}

export function SortUpIcon({ className }) {
  return (
    <svg
      className={className}
      stroke="red"
      fill="red"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="2em"
      width="2em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
    </svg>
  );
}

export function SortDownIcon({ className }) {
  return (
    <svg
      className={className}
      stroke="green"
      fill="green"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="2em"
      width="2em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
    </svg>
  );
}

function Tablecomponent({ columns, data }) {
  // Use the useTable Hook to send the columns and data to build the table

  
  const {
    getTableProps, // table props from react-table
    getTableBodyProps, // table body props from react-table
    headerGroups, // headerGroups, if your table has groupings
    rows, // rows for the table based on the data passed
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  const [selectedMatcode, setSelectedMatcode] = useState("");
  const setActiveMatcode = (matcode) => {
    setSelectedMatcode(matcode);
    // console.log(selectedMatcode);
  };

  return (
    <>
      <div className="flex justify-between align-middle">
        {/* search component */}
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        {/* filters component */}

        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map((column) =>
            column.Filter ? (
              <div key={column.id}>
                {/* <label htmlFor={column.id}>{column.render("Header")}: </label> */}
                {column.render("Filter")}
              </div>
            ) : null
          )
        )}
      </div>

      {/* table component */}
      <table className="mt-9  divide-y divide-gray-300 w-full">
        <thead
          className="bg-zinc-100 text-zinc-800  font-black"
          {...getTableProps()}
          border="1"
        >
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th
                  scope="col"
                  className="text-left py-2 text-[11px] font-bold text-gray-800 uppercase tracking-wider"
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render("Header")}

                  <span>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <SortDownIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <SortUpIcon className="w-4 h-4 text-gray-400" />
                      )
                    ) : (
                      <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          className="bg-white mb-9 divide-y divide-gray-200"
          {...getTableBodyProps()}
        >
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr className="bg-slate-50 mb-9 "
                {...row.getRowProps()}
                // onClick={() => {
                //   setActiveMatcode(row.values["material-code"]);
                //   // console.log("I am clicked!");
                //   // console.log(row.values["material-code"])
                // }}
              >
                {row.cells.map((cell) => {
                  // eslint-disable-next-line react/jsx-key

                  // eslint-disable-next-line react/jsx-key
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td
                      {...cell.getCellProps()}
                      className="px-2 py-7 text-[10px] border-y-2 mb-10 border-slate-500  whitespace-nowrap "
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        {/* new */}
        {/* <pre>
          <code>{JSON.stringify(state, null, 2)}</code>
        </pre> */}
      </div>
    </>
  );
}

export default Tablecomponent;

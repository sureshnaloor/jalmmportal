import React, { useState, Fragment, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/solid";
import HeaderComponent from "../../../components/HeaderComponent";

const departments = [
  {
    id: "1",
    name: "ESD",
    coordinator: "MOHAMED ABDUL RASEED",
    inactive: false,
  },
  { id: "2", name: "ISD", coordinator: "KUMAR LAMA", inactive: false },
  { id: "3", name: "MMD", coordinator: "ARNEL BALENA", inactive: false },
  { id: "4", name: "HRD", coordinator: "GYANANDRA ADHIKARI", inactive: false },
  { id: "5", name: "MGT", coordinator: "WALEED M ISHMAIL", inactive: false },
  { id: "6", name: "FIN", coordinator: "ASIF SYED", inactive: false },
  {
    id: "7",
    name: "John-Hopkins",
    coordinator: "WALEED M ISHMAIL",
    inactive: true,
  },
  { id: "8", name: "NEOM", coordinator: "WALEED M ISHMAIL", inactive: false },
  { id: "9", name: "EPMO", coordinator: "AFTAB HAYAT", inactive: false },
];

function Newsim() {
  const [selectedDepartment, setSelecteddepartment] = useState(departments[0]);
  const [account, setAccount] = useState("");
  const [employees, setEmployees] = useState([]);

  const [accounts, setAccounts] = useState([]);

  // fetch all records of employees

  const fetchEmployees = async () => {
    const response = await fetch(`/api/usermaster`);
    const json = await response.json();
    setEmployees(json);

    return json;
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  // auto complete suggestions

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsAccount, setSuggestionsAccount] = useState([]);
  const [suggestionsMobile, setSuggestionsMobile] = useState([]);

  const [inputValue, setInputvalue] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputvalue(value);

    // filter suggestions based on input value
    const filteredSuggestions = employees.filter((emp) => emp.empno == value);

    setSuggestions(filteredSuggestions);
  };

  const handleSelect = (value) => {
    setInputvalue(value);
    setSuggestions([]);
    // onSelect(value)
  };

  // fetch account and mobile numbers
  const fetchAccounts = async () => {
    const response = await fetch(`/api/sim`);
    const json = await response.json();
    setAccounts(json);

    return json;
  };
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInputChangeAccount = (e) => {
    const value = e.target.value;

    // filter suggestions based on input value
    const filteredSuggestions = accounts.filter((acc) =>
      acc["account-number"].includes(value)
    );

    if (value.length >= 6) setSuggestionsAccount(filteredSuggestions);
  };

  const handleInputChangeMobile = (e) => {
    const value = e.target.value;

    // filter suggestions based on input value
    const filteredSuggestions = accounts.filter((acc) =>
      acc["service-number"].includes(value)
    );

    if (value.length >= 6) setSuggestionsMobile(filteredSuggestions);
  };

  return (
    <div>
      <HeaderComponent />
      <div className="bg-slate-200">
        <div className="grid grid-cols-9 gap-2 m-3">
          {/* 1st grid for department */}
          <Listbox
            as="div"
            value={selectedDepartment}
            onChange={setSelecteddepartment}
            className="col-span-2 px-3 py-9"
          >
            <Listbox.Label className="uppercase text-[14px] text-slate-800  px-3 mb-5">
              Department:
            </Listbox.Label>
            <Listbox.Button className="text-[12px] text-sky-800 bg-white shadow-md py-1 px-3 shadow-slate-600">
              {selectedDepartment.name}
            </Listbox.Button>

            <Listbox.Options>
              {departments.map((dept) => (
                <Listbox.Option
                  key={dept.id}
                  value={dept}
                  disabled={dept.inactive}
                  as={Fragment}
                >
                  {({ active, selected }) => (
                    <li
                      className={`${
                        active
                          ? "bg-blue-500 text-white w-1/2 text-[12px] p-1 "
                          : "bg-zinc-100 text-black w-1/2 text-[12px] p-1 "
                      }`}
                    >
                      {selected && (
                        <CheckIcon className="h-5 w-5 inline-block" />
                      )}
                      {dept.name}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>

          {/* 2nd grid for coordinator */}
          <h3 className="col-span-3 px-1 py-9 font-bold text-sky-900">
            <span className="text-slate-800/80 font-semibold">
              {" "}
              Coordinator:{" "}
            </span>{" "}
            {selectedDepartment.coordinator}
          </h3>

          {/* 3rd grid for name of employee- fetch from mongodb users collection */}
          <div className="col-span-3">
            <span className="text-zinc-900 uppercase font-bold mr-6">
              {" "}
              User:{" "}
            </span>
            <input
              className="mt-9 w-96 uppercase tracking-wider font-Poppins"
              label="employee"
              id="employee"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="...type emp number"
            />

            <ul>
              {suggestions.map((item, index) => (
                <li key={index} onClick={() => handleSelect(item.empname)}>
                  {item.empno} {item.empname}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-12">
          <div className="col-span-3 px-9 py-9">
            {" "}
            <label
              htmlFor="accnumber"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Account number:
            </label>
            <input
              type="text"
              id="accnumber"
              className="block w-1/2 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange={handleInputChangeAccount}
            />
            <ul>
              {suggestionsAccount.map((item, index) => (
                <li key={index}>{item["account-number"]}</li>
              ))}
            </ul>
          </div>
          <div className="col-span-3 px-9 py-9">
            <label
              htmlFor="mobilenumber"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              onChange={handleInputChangeMobile}
            >
              Mobile number:
            </label>
            <input
              type="text"
              id="mobilenumber"
              className="block w-1/2 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />

            <ul>
              {suggestionsMobile.map((item, index) => (
                <li key={index}>{item["service-number"]}</li>
              ))}
            </ul>
          </div>
          <div className="col-span-2  px-1 py-9">
            <div>
              <label
                htmlFor="plan"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Plan:
              </label>
              <input
                type="text"
                id="plan"
                className="block w-1/2 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
            </div>
            <div className="col-span-2 px-1 py-9">
              <label
                htmlFor="creditlimit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Credit limit:
              </label>
              <input
                type="text"
                id="creditlimit"
                className="block w-1/2 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />{" "}
            </div>

            <div className="col-span-2 px-1 py-9">
              <label
                htmlFor="location"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Location:
              </label>
              <input
                type="text"
                id="location"
                className="block w-1/2 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />{" "}
            </div>
          </div>
          <div className="flex justify-center">
          <button type="button" className="bg-sky-900 text-white py-1 px-3 rounded mb-4">
          Save
        </button>
        </div>
        </div>

        {/* save Button */}

       

      </div>
    
  );
}

export default Newsim;

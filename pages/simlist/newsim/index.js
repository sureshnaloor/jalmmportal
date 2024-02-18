import React, { useState, Fragment, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/solid";
import HeaderComponent from "../../../components/HeaderComponent";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";

const departments = [
  {
    id: "0",
    name: "Dept....",
    coordinator: "Coordinator...",
    inactive: false,
  },
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

const plans = ["BN50", "BN80", "BN100", "BN200"];

function Newsim() {
  const [selectedDepartment, setSelecteddepartment] = useState(departments[0]);
  const [selectedPlan, setSelectedplan] = useState(plans[0]);
  const [account, setAccount] = useState("");
  const [employees, setEmployees] = useState([]);

  const [accounts, setAccounts] = useState([]);
  const router = useRouter();


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
  const [Mobile, setMobile] = useState(null);
  const [accountNumber, setAccountNumber] = useState(null);
  const [creditlimit, setCreditlimit] = useState(0)
  const [plan,setPlan] = useState("")
  const [location, setLocation] = useState("")
  const [section, setSection] = useState("")

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
    setAccountNumber(value);
  };

  const handleInputChangeMobile = (e) => {
    const value = e.target.value;

    // filter suggestions based on input value
    const filteredSuggestions = accounts.filter((acc) =>
      acc["service-number"].includes(value)
    );

    if (value.length >= 6) setSuggestionsMobile(filteredSuggestions);
    setMobile(value);
  };

  const handleSave = async (e) =>  {
    e.preventDefault();
    // console.log("save clicked");
    // console.log(
    const deptname = selectedDepartment.name
    const coordinator = selectedDepartment.coordinator
    const empno = inputValue.split(":")[0]
    const empname = inputValue.split(":")[1]
    //   accountNumber,
    //   Mobile,
    //   selectedPlan,
    //   location,
    //   creditlimit

    // );

    let body = {
      deptname,
      coordinator,
      empno,
      empname,
      accountNumber,
      Mobile,
      selectedPlan,
      location,
      creditlimit,
      section
    };

    const result = await fetch(`/api/sim`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    });

    toast.success("new SIM inserted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    console.log("clickd save button")

    router.reload();
  };

  const handleBack = (e) => {
    e.preventDefault();
    console.log("back clicked");
  };

  return (
    <div>
      <HeaderComponent />
      <main className="flex justify-center align-middle mt-12">
        <div className="bg-slate-200  p-6 w-3/5 h-5/6 border-2 border-slate-400 shadow-lg shadow-slate-600">
          <div className="grid grid-cols-10 gap-2">
            {/* 1st grid for department */}
            <Listbox
              as="div"
              value={selectedDepartment}
              onChange={setSelecteddepartment}
              className="col-span-2 "
            >
              <Listbox.Label className="uppercase text-[12px] text-slate-800 px-3 font-lato font-bold">
                Department:
              </Listbox.Label>
              <Listbox.Button className="text-[12px] font-bold text-sky-800 bg-white shadow-md py-1 px-3 shadow-slate-600">
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
            <h3 className="col-span-4 font-bold text-sky-900 text-[13px] px-6 ">
              <span className="text-slate-800 font-bold text-[12px] uppercase font-Lato">
                {" "}
                Coordinator:{" "}
              </span>{" "}
              <p className="py-2 px-3 bg-sky-400 text-zinc-900 font-bold shadow-sm shadow-zinc-300 mt-3 mr-12">
                {" "}
                {selectedDepartment.coordinator}
              </p>
            </h3>

            {/* 3rd grid for name of employee- fetch from mongodb users collection */}
            <div className="col-span-4">
              <span className="text-slate-900 uppercase font-bold font-lato text-[12px]">
                {" "}
                User:{" "}
              </span>
              <input
                className=" mt-3 w-80  uppercase tracking-wider font-bold font-lato text-[12px] p-2 bg-teal-400 text-stone-900 shadow-sm shadow-slate-300"
                label="employee"
                id="employee"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="...type emp number"
              />

              <ul>
                {suggestions.map((item, index) => (
                  <li key={index} onClick={() => handleSelect(item.empno + " :" + item.empname)}>
                    {item.empno} {item.empname}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-12 bg-gray-300 p-3 m-3">
            <div className="col-span-7 bg-sky-50 m-1 border-1 border-sky-800 shadow-lg shadow-sky-400">
              <p className="text-[10px] font-semibold text-red-800 p-1 m-auto font-lato">
                {" "}
                (Please exit by clicking 'back' if the 'account number' or
                'mobile number' exists already when you type.)
              </p>
              <div className="px-9 py-9">
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
              <div className="px-9 py-9">
                <label
                  htmlFor="mobilenumber"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Mobile number:
                </label>
                <input
                  type="text"
                  id="mobilenumber"
                  className="block w-1/2 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  onChange={handleInputChangeMobile}
                  placeholder="9 digit number without preceding 0"
                />

                <ul>
                  {suggestionsMobile.map((item, index) => (
                    <li key={index}>{item["service-number"]}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-span-5 bg-emerald-50 m-1 border-1 border-emerald-800 shadow-lg shadow-emerald-400 flex">
              
              <div className="py-9">
                <div >
                  <Listbox
                    as="div"
                    value={selectedPlan}
                    onChange={setSelectedplan}
                    
                  >
                    <Listbox.Label className="uppercase text-[12px] text-slate-800 px-3 font-lato font-bold">
                      Plan:
                    </Listbox.Label>
                    <Listbox.Button className="text-[12px] font-bold text-sky-800 bg-white shadow-md py-1 px-3 shadow-slate-600">
                      {selectedPlan}
                    </Listbox.Button>

                    <Listbox.Options>
                      {plans.map((plan) => (
                        <Listbox.Option key={plan} value={plan} as={Fragment}>
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
                              {plan}
                            </li>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Listbox>
                </div>
              </div>
              <div className="ml-2 border-4">
              <div className="px-1">
                <label
                  htmlFor="creditlimit"
                  className="block mb-3 text-[10px] uppercase font-Lato font-semibold text-gray-900 dark:text-white"
                >
                  Credit limit:
                </label>
                <input
                  type="text"
                  id="creditlimit"
                  value={creditlimit}
                  onChange={ e => setCreditlimit(e.target.value)}
                  className="w-1/2 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />{" "} <span> SAR </span>
              </div>

              <div className="px-1 py-3">
                <label
                  htmlFor="location"
                  className="block mb-2 text-[10px] font-lato font-semibold uppercase text-gray-900 dark:text-white"
                >
                  Location:
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-11/12 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />{" "}
              </div>

              <div className="px-1 py-3">
                <label
                  htmlFor="location"
                  className="block mb-2 text-[10px] font-lato font-semibold uppercase text-gray-900 dark:text-white"
                >
                  Section:
                </label>
                <input
                  type="text"
                  id="location"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="block w-11/12 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />{" "}
              </div>
              </div>
            </div>
          </div>
          <div className="flex justify-around">
            <button
              type="button"
              className="bg-red-800 text-white py-1 px-3 rounded mb-4 "
              onClick={handleBack}
            >
              Exit/Cancel
            </button>
            <button
              type="button"
              className="bg-sky-900 text-white py-1 px-3 rounded mb-4 "
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        {/* save Button */}
      </main>
    </div>
  );
}

export default Newsim;

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import "react-datepicker/dist/react-datepicker.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// data (input) for coordinators

const coordinators = [
  "MOHAMED ABDUL RASEED",
  "ARNEL BALENA",
  "GYANANDRA ADHIKARI",
  "ASIF SYED",
  "KUMAR LAMA",
  "AFTAB HAYAT",
  "WALEED M ISHMAIL",
];

// data for departments

const departments = [
  "ESD",
  "ISD",
  "MMD",
  "HRD",
  "MGT",
  "FIN",
  "John-Hopkins",
  "NEOM",
  "EPMO",
];

// data for sections

// data for locations
const locations = [
  "HEAD OFFICE",
  "JUBAIL",
  "SUBSTATION PROJECTS",
  "OTHER ESD PROJECTS",
  "ISD PROJECTS",
  "KHOBAR MALL",
  "ALHASA/DHAHRAN/ABQAIQ/RASTANURA",
];

function Simeditcomponent({ account, setShowModal }) {
  const [simedited, setSimedited] = useState({});
  const [planstartdate, setPlanstartdate] = useState(null);

  const [correctname, setCorrectname] = useState(null);
  const [empno, setEmpno] = useState(null);

  const { data: session } = useSession();
  const router = useRouter();

  // for coordinators

  const [filter1, setFilter1] = useState("");
  const [suggestions1, setSuggestions1] = useState([]);

  const handleInputChange1 = (e) => {
    const newFilter = e.target.value.toLowerCase();
    setFilter1(newFilter);

    const filteredSuggestionscoord = coordinators.filter((item) =>
      item.toLowerCase().includes(newFilter)
    );
    setSuggestions1(filteredSuggestionscoord);
  };

  const handleSuggestionClick1 = (item) => {
    setFilter1(item);
    setSuggestions1([]);
  };

  // for departments

  const [filter2, setFilter2] = useState("");
  const [suggestions2, setSuggestions2] = useState([]);

  const handleInputChange2 = (e) => {
    const newFilter = e.target.value.toLowerCase();
    setFilter2(newFilter);

    const filteredSuggestionsdep = departments.filter((item) =>
      item.toLowerCase().includes(newFilter)
    );
    setSuggestions2(filteredSuggestionsdep);
  };

  const handleSuggestionClick2 = (item) => {
    setFilter2(item);
    setSuggestions2([]);
  };

  // for sections

  // for locations

  const [filter3, setFilter3] = useState("");
  const [suggestions3, setSuggestions3] = useState([]);

  const handleInputChange3 = (e) => {
    const newFilter = e.target.value.toLowerCase();
    setFilter3(newFilter);

    const filteredSuggestionsloc = locations.filter((item) =>
      item.toLowerCase().includes(newFilter)
    );
    setSuggestions3(filteredSuggestionsloc);
  };

  const handleSuggestionClick3 = (item) => {
    setFilter3(item);
    setSuggestions3([]);
  };

  // for credit limit

  const [creditlimit, setCreditlimit] = useState(50)

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/usermaster/${account["emp-number"]}`);
      const json = await result.json();
      setCorrectname(json.empname);
    })();
  }, [account]);

  // console.log(correctname);
  // console.log(account);

  const updateCleansedsimlist = async (e) => {
    e.preventDefault();
    console.log("clicked inside");
    // set relevant fields in collection
    // simultanneously set the 'cleansed' flag in the original simlist collection
    console.log(filter1, filter2, filter3, creditlimit)
    const cleansed = await fetch(`/api/sim/cleansesim/${account["account-number"]}`,
    {
      method: "POST",
      body: JSON.stringify({
        filter2,
        filter3,
        filter1,
        creditlimit,
        correctname,
      }),

      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    }
    );
    toast.success("Submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.reload();
    return cleansed

  };

  const setdeleteFlag = async (e) => {
    // console.log("clicked to close the flag");
    await fetch(
      `/api/sim/closeconnection/${account["account-number"]}`,

      {
        method: "PUT",

        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-40 w-full h-full bg-stone-200 opacity-100">
      <div className="fixed inset-1/2 z-50 w-[67%] h-[97%] justify-center align-middle -translate-x-1/2 -translate-y-1/2 bg-slate-50 opacity-100 rounded-[20px] border-r-2 border-b-2 ">
        <button
          className="fixed top-5 right-5 text-[14px] font-semibold text-amber-900 bg-green-600 px-3 py-1 border-2 hover:text-white hover:bg-red-600"
          onClick={() => setShowModal(false)}
        >
          X
        </button>

        {/* update edited/cleansed simlist collection */}
        <div className="w-3/4 p-9 bg-zinc-100">
          <div className="flex justify-evenly align-bottom bg-slate-200 shadow-md shadow-sky-600 p-6">
            <div>
              <p className="uppercase text-[10px] font-bold">
                {" "}
                Account number:{" "}
              </p>
              <p className="font-black text-emerald-800 font-Lato text-lg tracking-wider mt-3">
                {" "}
                {account["account-number"]}
              </p>
            </div>

            <div>
              <p className="uppercase text-[10px] font-bold">
                {" "}
                Service Number:
              </p>
              <p className="font-black text-yellow-800 font-Lato text-lg tracking-wider mt-3">
                {" "}
                {account["service-number"]}
              </p>
            </div>

            <div>
              <p className="uppercase text-[10px] font-bold"> Current Plan: </p>
              <p className="font-black text-sky-800 font-Lato text-lg tracking-wider mt-3">
                {" "}
                {account.plan}{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-around align-top bg-zinc-200 py-6">
          <h3 className="font-bold text-[14px]">
            {" "}
            Name of user as in JAL record:{" "}
            <span className="font-black uppercase text-sky-900">
              {correctname}
            </span>{" "}
          </h3>
          <h3 className="font-bold text-[14px]">
            {" "}
            Name as in MMD EXCEL record:{" "}
            <span className="font-black uppercase text-sky-900">
              {" "}
              {account["employee-name"]}
            </span>
            <span>
              <p className="text-[11px] text-red-500">
                {" "}
                (The name will be corected as in JAL SAP record)
              </p>{" "}
            </span>
          </h3>
        </div>
        <div className="bg-slate-200 shadow-md shadow-zinc-800 p-3 m-3">
          <form
            className=" w-full  p-1"
            onSubmit={updateCleansedsimlist}
            // simultanneously set the 'cleansed' flag in the original simlist collection
          >
            <div> <p className="text-sky-800 font-think text-[10px] mb-3"> (For department, location and coordinator fields, press spacebar & backspace to get ALL options... enter suggestion to autocomplete) </p>
              <div className="grid grid-cols-9">
                <div className="col-span-3 w-full">
                  
                  <label
                    htmlFor="department"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    className="border-none outline-none bg-slate-100/70 text-gray-900 uppercase mb-3 font-bold  text-[12px] focus:ring-blue-500 focus:border-blue-500 block w-full py-1   dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:lowercase placeholder:text-stone-600/80 placeholder:font-thin  placeholder:text-[10px]"
                    placeholder="department..."
                    value={filter2}
                    onChange={handleInputChange2}
                  />
                  <div id="autocomplete-list">
                    {suggestions2.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick2(item)}
                      >
                        <p className="text-gray-900/90 text-xs italic mb-1">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-3 w-full">
                  <label
                    htmlFor="location"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Location:
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="border-none outline-none bg-slate-100/70 text-gray-900 uppercase mb-3 font-bold  text-[12px] focus:ring-blue-500 focus:border-blue-500 block w-full py-1   dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:lowercase placeholder:text-stone-600/80 placeholder:font-thin  placeholder:text-[10px]"
                    value={filter3}
                    onChange={handleInputChange3}
                    placeholder="Location..."
                  />
                  <div id="autocomplete-list">
                    {suggestions3.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick3(item)}
                      >
                        <p className="text-gray-900/90 text-xs italic mb-1">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-3 w-full">
                  <label
                    htmlFor="coordinator"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Coordinator:
                  </label>
                  <input
                    type="text"
                    id="coordinator"
                    className="border-none outline-none bg-slate-100/70 text-gray-900 uppercase mb-3 font-bold  text-[12px] focus:ring-blue-500 focus:border-blue-500 block w-full py-1   dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:lowercase placeholder:text-stone-600/80 placeholder:font-thin  placeholder:text-[10px]"
                    value={filter1}
                    onChange={handleInputChange1}
                    placeholder="press spacebar to get options... enter suggestion to autocomplete"
                  />
                  <div id="autocomplete-list">
                    {suggestions1.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick1(item)}
                      >
                        <p className="text-gray-900/90 text-xs italic mb-1">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-1/2">
                <div>
                  <label
                    htmlFor="creditlimit"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Credit Limit:
                  </label>
                  <input
                    type="text"
                    id="creditlimit"
                    className="border-none outline-none bg-slate-100/70 text-gray-900 uppercase mb-3 font-bold  text-[12px] focus:ring-blue-500 focus:border-blue-500 block w-1/4 py-1   dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:lowercase placeholder:text-stone-600/80 placeholder:font-thin  placeholder:text-[10px]"
                    placeholder="Employee number..."
                    value={creditlimit}
                    onChange={(e) => setCreditlimit(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <button
                  className="mt-9 mx-auto  bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-2 my-2 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                  type="submit"
                >
                  {" "}
                  SAVE{" "}
                </button>
              </div>
            </div>
          </form>
        </div>
        {/* the final part where 'transfer' and 'delete' button will be provided.  */}
        <div className="p-1 bg-stone-100 flex justify-between align-middle">
          <button className="text-white text-xs hover:text-gray-200 bg-zinc-500  hover:bg-zinc-800 rounded border-b-4 border-zinc-500 sm:p-2 inline-flex items-center dark:hover:text-gray-300">
            {" "}
            Transfer{" "}
          </button>
          <button
            className="text-white text-xs rounded border-b-4 border-red-600 bg-red-800 hover:text-gray-200 p-1 sm:p-2 inline-flex items-center dark:hover:text-gray-300"
            onClick={setdeleteFlag}
          >
            {" "}
            Delete{" "}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Simeditcomponent;

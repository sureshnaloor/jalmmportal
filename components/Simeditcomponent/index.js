import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Simeditcomponent({ account, setShowModal }) {
  const [simedited, setSimedited] = useState({});
  const [planstartdate, setPlanstartdate] = useState(null);

  const [correctname, setCorrectname] = useState(null);
  const [empno, setEmpno] = useState(null);

  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/usermaster/${account["emp-number"]}`);
      const json = await result.json();
      setCorrectname(json.empname);
    })();
  }, [account]);

  // console.log(correctname);
  console.log(account);

  const updateCleansedsimlist = async (e) => {
    e.preventDefault();
    // console.log("clicked inside");
    // set relevant fields in collection
    // simultanneously set the 'cleansed' flag in the original simlist collection
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
            <div>
              <div className="grid grid-cols-3">
                <div className="col-span-1">
                  <label
                    htmlFor="employee name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="empno"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Employee number..."
                    value={account["emp-number"]}
                    onChange={(e) => setEmpno(e.target.value)}
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="employee name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Section:
                  </label>
                  <input
                    type="text"
                    id="empno"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Employee number..."
                    value={account["emp-number"]}
                    onChange={(e) => setEmpno(e.target.value)}
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="employee name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Location:
                  </label>
                  <input
                    type="text"
                    id="empno"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Employee number..."
                    value={account["emp-number"]}
                    onChange={(e) => setEmpno(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-1/2">
                <label
                  htmlFor="employee name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Coordinator:
                </label>
                <input
                  type="text"
                  id="empno"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Employee number..."
                  value={account["emp-number"]}
                  onChange={(e) => setEmpno(e.target.value)}
                />
              </div>

              <div className="w-1/2 grid grid-cols-2">
                <div className="col-span-1">
                  <label
                    htmlFor="employee name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Credit Limit:
                  </label>
                  <input
                    type="text"
                    id="empno"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Employee number..."
                    value={account["emp-number"]}
                    onChange={(e) => setEmpno(e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <button
                    className="mt-9 mx-auto  bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-2 my-2 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                    type="submit"
                  >
                    {" "}
                    SAVE{" "}
                  </button>
                </div>
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

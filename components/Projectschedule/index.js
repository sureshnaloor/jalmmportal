import React, { useState } from "react";
import { Chart } from "react-google-charts";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Projectschedule({ projnumber }) {
  const [actstartdate, setActstartdate] = useState(new Date());
  const [actenddate, setActeddate] = useState(new Date());
  const [activity, setActivity] = useState(" ");
  const [duration, setDuration] = useState(null);
  const [complete, setComplete] = useState(0);
  const [dependencies, setDependencies] = useState([]);

  const columns = [
    { type: "string", label: "Activity ID" },
    { type: "string", label: "Activity Name" },
    { type: "date", label: "Activity Start" },
    { type: "date", label: "Activity End" },
    { type: "number", label: "Duration" },
    { type: "number", label: "Percent complete" },
    { type: "string", label: "Dependencies" },
  ];

  function daysToMilliseconds(days) {
    return days * 24 * 60 * 60 * 1000;
  }

  function betweenRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const rows = [
    [
      "Procure",
      "Purchase GIS SG",
      new Date(2023, 0, 1),
      new Date(2023, 6, 5),
      null,
      100,
      null,
    ],
    [
      "Construct",
      "Prefab Building",
      null,
      new Date(2023, 6, 30),
      daysToMilliseconds(60),
      25,
      "Procure",
    ],
    [
      "Constructroad",
      "Roads and asphalting",
      null,
      new Date(2023, 7, 30),
      daysToMilliseconds(60),
      25,
      null,
    ],
    [
      "Install",
      "Install transformer",
      null,
      new Date(2023, 10, 7),
      daysToMilliseconds(1),
      20,
      "Procure",
    ],
    [
      "Test",
      "Test GIS",
      null,
      new Date(2023, 10, 10),
      daysToMilliseconds(5),
      0,
      "Install",
    ],
    [
      "Commission",
      "Commision GIS",
      null,
      new Date(2023, 10, 16),
      daysToMilliseconds(1),
      100,
      "Procure",
    ],
  ];
  const data = [columns, ...rows];

  return (
    <>
      <div className="relative pb-6 mb-3 overflow-hidden rounded-lg shadow-lg cursor-pointer m-4 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
        <span className="absolute top-0 left-0 flex flex-col items-center mt-3 ml-3 px-2 py-2 rounded-full z-10 bg-yellow-500 text-sm font-medium text-white select-none dark:bg-yellow-600 dark:text-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mb-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span className="absolute top-0 right-0 items-center inline-flex mt-3 mr-3 px-3 py-2 rounded-full z-10 bg-white text-sm font-medium text-white select-none dark:bg-gray-400">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-4 dark:bg-green-700"></span>
          <p className="text-sm text-gray-500 dark:text-gray-100">
            Open Project
          </p>
        </span>
        <div className="items-center text-center m-3">
          <p className="text-lg font-bold text-gray-700  dark:text-gray-200">
            Project: {projnumber}
          </p>
        </div>
      </div>

      {/* input of data */}

      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-40 pb-40 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
        <div className="text-[14px] font-italic py-3 px-6  bg-purple-400 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Longlead <br /> Procurement <br /> Data
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3">
          <label
            htmlFor="activity"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Activity:
          </label>
          <input
            type="text"
            name="activity"
            value={activity}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 pb-3 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="activity"
            placeholder="Activity Name"
            onChange={(e) => {
              setActivity(e.target.value);
              console.log(activity);
            }}
          />

          <label
            htmlFor="actstartdate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Activity start date:
          </label>

          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={actstartdate}
            onChange={(date) => {
              setActstartdate(date);
              console.log(actstartdate);
            }}
          />

          <label
            htmlFor="duration"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Duration in days
          </label>

          <input
            type="text"
            name="duration"
            value={duration}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 pb-3 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="duration"
            placeholder="Duration in days...."
            onChange={(e) => {
              setDuration(e.target.value);
              console.log(duration);
            }}
          />
          <button
            className="bg-zinc-600 text-white text-xs p-3 mb-3"
            onClick={async (e) => {
              const activityid = `procure#${betweenRandomNumber(
                100000,
                999999
              )}`;
              e.preventDefault();
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  activityid,
                  activity,
                  actstartdate,
                  duration,
                }),
              };
              await fetch(`/api/projects/projschedule`, requestOptions);
              setDuration(null);
              setActivity("");
            }}
          >
            {" "}
            Add Activity{" "}
          </button>
        </div>

        <div className="text-[14px] font-italic py-3 px-6  bg-cyan-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Site <br /> construction <br /> Data
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3">
          <label
            htmlFor="activity"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Activity:
          </label>
          <input
            type="text"
            name="activity"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 pb-3 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="activity"
            placeholder="Activity Name"
            onChange={(e) => {
              setActivity(e.target.value);
              console.log(activity);
            }}
          />

          <label
            htmlFor="actstartdate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Activity start date:
          </label>

          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={actstartdate}
            onChange={(date) => setActstartdate(date)}
          />

          <label
            htmlFor="duration"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Duration:
          </label>

          <input
            type="text"
            name="duration"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 pb-3 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="duration"
            placeholder="Duration in days...."
            onChange={(e) => {
              setDuration(e.target.value);
              console.log(duration);
            }}
          />

          <button
            className="bg-zinc-600 text-white text-xs p-3 mb-3"
            onClick={async (e) => {
              const activityid = `construct#${betweenRandomNumber(
                100000,
                999999
              )}`;
              e.preventDefault();
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  activityid,
                  activity,
                  actstartdate,
                  duration,
                }),
              };
              await fetch(`/api/projects/projschedule`, requestOptions);
            }}
          >
            {" "}
            Add Activity{" "}
          </button>
        </div>

        <div className="text-[14px] font-italic py-3 px-6  bg-sky-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Install <br /> Test <br /> Commission <br /> Data
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3">
          <label
            htmlFor="activity"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Activity:
          </label>
          <input
            type="text"
            name="activity"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 pb-3 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="activity"
            placeholder="Activity Name"
            onChange={(e) => {
              setActivity(e.target.value);
              console.log(activity);
            }}
          />

          <label
            htmlFor="actstartdate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Activity start date:
          </label>

          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={actstartdate}
            onChange={(date) => setActstartdate(date)}
          />

          <label
            htmlFor="duration"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Duration:
          </label>

          <input
            type="text"
            name="duration"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 pb-3 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="duration"
            placeholder="Duration in days...."
            // value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
              console.log(duration);
            }}
          />

          <button
            className="bg-zinc-600 text-white text-xs p-3 mb-3"
            onClick={async (e) => {
              const activityid = `commission#${betweenRandomNumber(
                100000,
                999999
              )}`;
              e.preventDefault();
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  activityid,
                  activity,
                  actstartdate,
                  duration,
                }),
              };
              await fetch(`/api/projects/projschedule`, requestOptions);
            }}
          >
            {" "}
            Add Activity{" "}
          </button>
        </div>
      </div>

      <Chart chartType="Gantt" width="70%" height="400px" data={data} />

      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-40 pb-40 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
      <div className="text-[14px] font-italic py-3 px-6  bg-cyan-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Equipment Mobilized in the project 
          </h3>
        </div>
      </div>

      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-40 pb-40 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
      <div className="text-[14px] font-italic py-3 px-6  bg-cyan-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Daily Activity: 
          </h3>
        </div>
      </div>
    </>
  );
}

export default Projectschedule;

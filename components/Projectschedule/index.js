import React, { useState } from "react";
import { Chart } from "react-google-charts";
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Projectschedule({ projnumber }) {
  const [actstartdate, setActstartdate] = useState(new Date());
  const [actenddate, setActeddate] = useState(new Date());
  const [activity, setActivity] = useState(" ");
  const [duration, setDuration] = useState(null);
  const [complete, setComplete] = useState(0);
  const [dependencies, setDependencies] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openSection, setOpenSection] = useState(null);

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

  const sections = [
    {
      id: "procurement",
      title: "Longlead Procurement Data",
      color: "bg-purple-400",
      prefix: "procure"
    },
    {
      id: "construction",
      title: "Site Construction Data",
      color: "bg-cyan-600",
      prefix: "construct"
    },
    {
      id: "commission",
      title: "Install, Test & Commission Data",
      color: "bg-sky-600",
      prefix: "commission"
    }
  ];

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

      <div className="space-y-4 m-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-lg bg-white dark:bg-gray-700 shadow">
            <button
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className={`flex w-full justify-between ${section.color} px-4 py-3 text-left text-sm font-medium text-white rounded-lg focus:outline-none`}
            >
              <span>{section.title}</span>
              <span className="ml-6 flex-shrink-0">
                {openSection === section.id ? '▼' : '▶'}
              </span>
            </button>
            
            {openSection === section.id && (
              <div className="p-4 border-t dark:border-gray-600">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Activity:
                    </label>
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="Activity Name"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Activity start date:
                    </label>
                    <DatePicker
                      selected={actstartdate}
                      onChange={(date) => setActstartdate(date)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Duration in days:
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="Duration in days..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="bg-zinc-600 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg"
                      onClick={async (e) => {
                        const activityid = `${section.prefix}#${betweenRandomNumber(100000, 999999)}`;
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
                      Add Activity
                    </button>
                    {editMode && (
                      <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-4 py-2 rounded-lg"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Chart chartType="Gantt" width="100%" height="400px" data={data} />

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

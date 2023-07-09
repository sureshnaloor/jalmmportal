import React from "react";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";


function vendorevaluationpastyears({ vendornumber }) {

const [score2018, setScore2018] = useState(0)
const [score2019, setScore2019] = useState(0)
const [score2020, setScore2020] = useState(0)
const [score2021, setScore2021] = useState(0)

const { data: session } = useSession();

  return (
    <div className="bg-zinc-100 mx-auto w-5/6 drop-shadow rounded-md mb-9">
      <h4 className="mb-3 py-3 shadow-lg shadow-slate-200 mx-auto my-auto bg-teal-600 text-white font-bold font-italic tracking-widest">
        {" "}
        The Evaluation marks for past years for the vendor code: {vendornumber}
      </h4>

      <div className="grid grid-cols-4">
        <div className="col-span-1">
          {" "}
          <h3 className="bg-amber-200 text-green-900 pr-9 mr-9">
            Year 2018 Score
          </h3>
        </div>
        <div className="col-span-1">
          {" "}
          <h3 className="bg-sky-200 text-green-900 pr-9 mr-9">
            Year 2019 Score
          </h3>
        </div>
        <div className="col-span-1">
          {" "}
          <h3 className="bg-emerald-200 text-green-900 pr-9 mr-9">
            Year 2020 Score{" "}
          </h3>
        </div>
        <div className="col-span-1">
          {" "}
          <h3 className="bg-teal-200 text-green-900 pr-9 mr-9">
            Year 2021 Score
          </h3>
        </div>

        {/* now for the input or output display of the scores */}

        <div className="mt-3 grid grid-cols-2">
          <input
            type="text"
            id="year2018"
            onChange={e => setScore2018(e.target.value)}
            className="h-[24px] col-span-1 w-1/2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          
           <button onClick={async () => {
            // console.log("I am clicked", score2018)
            await fetch(
                `/api/vendors/vendorevalpastyears/${vendornumber}`,
                {
                  method: "PUT",
                  body: JSON.stringify({
                    pastyear: '2018',
                    score: score2018,
                    createdBy: session?.user?.name,
                    createdAt: new Date(),
                  }),
                  headers: new Headers({
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  }),
                }
              );
           }} className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500 hover:bg-blue-700 text-white  rounded-full">
            Update
          </button>
          
        </div>   
            

        <div className="mt-3 grid grid-cols-2">
          <input
            type="text"
            id="year2019"
            onChange={e => setScore2019(e.target.value)}
            className="h-[24px] col-span-1 w-1/2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          
           <button 
           onClick={async () => {
            // console.log("I am clicked", score2018)
            await fetch(
                `/api/vendors/vendorevalpastyears/${vendornumber}`,
                {
                  method: "PUT",
                  body: JSON.stringify({
                    pastyear: '2019',
                    score: score2019,
                    createdBy: session?.user?.name,
                    createdAt: new Date(),
                  }),
                  headers: new Headers({
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  }),
                }
              );
           }}
           className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500  hover:bg-blue-500 text-white  rounded-full">
            Update
          </button>
          
        </div>   

        <div className="mt-3 grid grid-cols-2">
          <input
            type="text"
            id="year2020"
            onChange={e => setScore2020(e.target.value)}
            className="h-[24px] col-span-1 w-1/2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          
           <button 
           
           onClick={async () => {
            // console.log("I am clicked", score2018)
            await fetch(
                `/api/vendors/vendorevalpastyears/${vendornumber}`,
                {
                  method: "PUT",
                  body: JSON.stringify({
                    pastyear: '2020',
                    score: score2020,
                    createdBy: session?.user?.name,
                    createdAt: new Date(),
                  }),
                  headers: new Headers({
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  }),
                }
              );
           }}className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500 hover:bg-blue-700 text-white  rounded-full">
            Update
          </button>
          
        </div>   

        <div className="mt-3 grid grid-cols-2">
          <input
            type="text"
            id="year2021"
            onChange={e => setScore2021(e.target.value)}
            className="h-[24px] col-span-1 w-1/2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          
           <button 
           onClick={async () => {
            // console.log("I am clicked", score2018)
            await fetch(
                `/api/vendors/vendorevalpastyears/${vendornumber}`,
                {
                  method: "PUT",
                  body: JSON.stringify({
                    pastyear: '2021',
                    score: score2021,
                    createdBy: session?.user?.name,
                    createdAt: new Date(),
                  }),
                  headers: new Headers({
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  }),
                }
              );
           }}className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500 hover:bg-blue-700 text-white  rounded-full">
            Update
          </button>
          
        </div>   
      </div>
    </div>
  );
}

export default vendorevaluationpastyears;

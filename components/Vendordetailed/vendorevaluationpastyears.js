import React from "react";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function vendorevaluationpastyears({ vendornumber }) {
  const [score2022, setScore2022] = useState(0);
  const [score2019, setScore2019] = useState(0);
  const [score2020, setScore2020] = useState(0);
  const [score2021, setScore2021] = useState(0);

  const { data: session } = useSession();
  const router = useRouter();

  const [vendorpastscores, setVendorpastscores] = useState([]);
  

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/vendors/vendorevalpastyears/${vendornumber}`
      );
      const json = await result.json();
      setVendorpastscores(json);
      
    })();   

    
  }, [vendornumber]);

  return (
    <div className="bg-zinc-100 p-6 mx-auto w-5/6 drop-shadow rounded-md mb-9 shadow-xl shadow-zinc-800">
      <h4 className="mb-3 py-1 px-6 w-1/2 shadow-lg text-[14px] shadow-slate-200 mx-auto my-auto bg-teal-600 text-white font-bold font-italic tracking-widest">
        {" "}
        The Evaluation marks for past years for the vendor code: {vendornumber}
      </h4>

      <div>
        <div className="grid grid-cols-4 gap-10">
          <div className="col-span-1">
            {" "}
            <h3 className="w-1/2 bg-amber-200 text-green-900 mx-auto py-1 font-bold text-[12px]">
              2019:
            </h3>
          </div>
          <div className="col-span-1">
            {" "}
            <h3 className="w-1/2 bg-sky-200 text-green-900 mx-auto py-1 font-bold text-[12px]">
              2020:
            </h3>
          </div>
          <div className="col-span-1">
            {" "}
            <h3 className="w-1/2 bg-emerald-200 text-green-900 mx-auto py-1 font-bold text-[12px]">
              2021:
            </h3>
          </div>
          <div className="col-span-1">
            {" "}
            <h3 className="w-1/2 bg-teal-200 text-green-900 mx-auto py-1 font-bold text-[12px]">
              2022:
            </h3>
          </div>

          {/* now for the input or output display of the scores */}

          {vendorpastscores["past"]?.find(past=>past.pastyear=="2019")?.pastyearscore >= 0 ? ( 
          
            <p className="pt-3 ml-20 mt-1 font-bold text-[12px] text-teal-900">
              {" "}
              Score:
              <span className=" bg-amber-500 text-white shadow-md shadow-slate-300 text-sm p-2 ml-3">{vendorpastscores["past"].find(past=>past.pastyear=="2019")?.pastyearscore.toString()}</span>
            </p>
          ) : (
            <div className="ml-20 mt-3 grid grid-cols-2">
              <input
                type="text"
                id="year2019"
                onChange={(e) => setScore2019(e.target.value)}
                className="h-[24px] col-span-1 w-1/2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />

              <button
                onClick={async () => {
                  // console.log("I am clicked", score2018)
                  const response = await fetch(
                    `/api/vendors/vendorevalpastyears/${vendornumber}`,
                    {
                      method: "PUT",
                      body: JSON.stringify({
                        pastyear: "2019",
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

                  toast.success(
                    `The PAST EVALUATION SCORE FOR YEAR 2019 for the vendor ${vendornumber} is updated, thanks!`,
                    {
                      position: toast.POSITION.TOP_RIGHT,
                    }
                  );
                  router.reload();
                  
                }}
                className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500 hover:bg-blue-700 text-white  rounded-full"
              >
                Update
              </button>
            </div>
          )}

          {vendorpastscores["past"]?.find(past=>past.pastyear=="2020")?.pastyearscore >= 0 ? (
            <p className="pt-3 mt-1 ml-20 font-bold  text-sm text-teal-900">
              {" "}
              Score:
              <span className="bg-sky-500 text-white shadow-md shadow-slate-300 text-sm p-2 ml-3">{vendorpastscores["past"].find(past=>past.pastyear=="2020")?.pastyearscore.toString()}</span>
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2">
              <input
                type="text"
                id="year2020"
                onChange={(e) => setScore2020(e.target.value)}
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
                        pastyear: "2020",
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
                  toast.success(
                    `The PAST EVALUATION SCORE FOR YEAR 2020 for the vendor ${vendornumber} is updated, thanks!`,
                    {
                      position: toast.POSITION.TOP_RIGHT,
                    }
                  );
                  router.reload();
                }}
                className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500  hover:bg-blue-500 text-white  rounded-full"
              >
                Update
              </button>
            </div>
          )}

          {vendorpastscores["past"]?.find(past=>past.pastyear=="2021")?.pastyearscore >= 0 ? (
            <p className="pt-3 mt-1 ml-20 font-bold text-sm text-teal-900">
              {" "}
              Score:
              <span className="bg-emerald-500 text-white shadow-md shadow-slate-300 text-sm p-2 ml-3">{vendorpastscores["past"].find(past=>past.pastyear=="2021")?.pastyearscore.toString()}</span>
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2">
              <input
                type="text"
                id="year2021"
                onChange={(e) => setScore2021(e.target.value)}
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
                        pastyear: "2021",
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

                  toast.success(
                    `The PAST EVALUATION SCORE FOR YEAR 2021 for the vendor ${vendornumber} is updated, thanks!`,
                    {
                      position: toast.POSITION.TOP_RIGHT,
                    }
                  );
                  router.reload();
                }}
                className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500 hover:bg-blue-700 text-white  rounded-full"
              >
                Update
              </button>
            </div>
          )}

          {vendorpastscores["past"]?.find(past=>past.pastyear=="2022")?.pastyearscore >= 0 ? (
            <p className="pt-3 mt-1 ml-20 font-bold text-sm text-teal-900">
              {" "}
              Score:
              <span className="bg-teal-300 text-white shadow-md shadow-slate-300 text-sm p-2 ml-3">{vendorpastscores["past"].find(past=>past.pastyear=="2022")?.pastyearscore.toString()}</span>
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2">
              <input
                type="text"
                id="year2022"
                onChange={(e) => setScore2022(e.target.value)}
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
                        pastyear: "2022",
                        score: score2022,
                        createdBy: session?.user?.name,
                        createdAt: new Date(),
                      }),
                      headers: new Headers({
                        "Content-Type": "application/json",
                        Accept: "application/json",
                      }),
                    }
                  );
                  toast.success(
                    `The PAST EVALUATION SCORE FOR YEAR 2022 for the vendor ${vendornumber} is updated, thanks!`,
                    {
                      position: toast.POSITION.TOP_RIGHT,
                    }
                  );
                  router.reload();
                }}
                className="h-[24px] w-1/2 col-span-1 mr-20 font-bold text-[12px] bg-blue-500 hover:bg-blue-700 text-white  rounded-full"
              >
                Update
              </button>
            </div>
          )}
        </div>
                          
      </div>
    </div>
  );
}

export default vendorevaluationpastyears;

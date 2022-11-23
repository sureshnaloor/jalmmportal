import React from "react";
import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import moment from "moment";

function Projectdetails() {
  const [project, setProject] = useState({});
  const [network, setNetwork] = useState({});
  const [specialstk, setSpecialstk] = useState([]);
  const [purchaseorders, setPurchaseorders] = useState([]);
  const [openrequisitions, setOpenrequisitions] = useState([]);

  let projectid = "IS%2FGP.22.001";

  const { data: session } = useSession();

  useEffect(() => {
    const fetchProject = async () => {
      const response = await fetch(`/api/projects/${projectid}`);
      const json = await response.json();
      setProject(json);
    };
    fetchProject();
  }, [projectid]);

  useEffect(() => {
    const fetchNetwork = async () => {
      const response = await fetch(`/api/networks/${projectid}`);
      const json = await response.json();
      setNetwork(json);
    };
    fetchNetwork();
  }, [projectid]);

  useEffect(() => {
    const fetchSpecialstk = async () => {
      const response = await fetch(`/api/specialstock/project/${projectid}`);
      const json = await response.json();
      setSpecialstk(json);
    };
    fetchSpecialstk();
  }, [projectid]);

  useEffect(() => {
    const fetchPurchaseorders = async () => {
      const response = await fetch(`/api/purchaseorders/project/${projectid}`);
      const json = await response.json();
      setPurchaseorders(json);
    };
    fetchPurchaseorders();
  }, [projectid]);

  useEffect(() => {
    const fetchOpenrequisitions = async () => {
      const response = await fetch(
        `/api/openrequisitions/project/${projectid}`
      );
      const json = await response.json();
      setOpenrequisitions(json);
    };
    fetchOpenrequisitions();
  }, [projectid]);

  // console.log(project)
  // console.log(specialstk);
  // console.log(purchaseorders)
  console.log(openrequisitions);

  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-24 mx-auto">
        
          <div className="flex flex-wrap w-full  flex-col border-slate-600 shadow-outer my-4 bg-gradient-to-r from-cyan-100 to-amber-100">
            <div className="h-1 bg-gray-200 rounded overflow-hidden">
              <div className="w-24 h-full bg-blue-500"></div>
            </div>

            <h1 className="md:text-xl lg:text-2xl font-medium title-font mb-2 text-gray-900">
              <span className="text-md text-blue-800 font-Freehand">
                {" "}
                Project name:{" "}
              </span>
              {project["project-name"]}
            </h1>
            <p className="lg:w-1/2 w-full leading-relaxed text-xl text-gray-500 pb-3">
              <span className="text-md text-blue-800"> Project Manager: </span>
              {project["project-incharge"]}
            </p>
            <p className="ml-auto lg:w-1/2 w-full leading-relaxed text-lg text-yellow-500">
              <span className="text-md text-orange-800"> Project start: </span>
              {project["start-date"]}
            </p>
            <p className="pb-4 ml-auto lg:w-1/2 w-full leading-relaxed text-lg text-yellow-500">
              <span className="text-md text-orange-800">
                {" "}
                Project scheduled end:{" "}
              </span>
              {project["finished-date"]}
            </p>
            {!network ? null : (
              <p className="ml-auto lg:w-1/2 w-full leading-relaxed text-lg text-gray-800">
                <span className="text-md text-blue-800"> Network Number: </span>
                {network["network-num"]}
              </p>
            )}
          </div>
          <div className="flex flex-wrap -m-4">
          <div className="xl:w-1/3 md:w-1/2 p-4">
              <div className="border border-gray-200 p-6 rounded-lg">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"></path>
                  </svg>
                </div>
                <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                  PROJECT DOCUMENTS
                </h2>
                <p className="leading-relaxed text-base">
                  Fingerstache flexitarian street art 8-bit waist co, subway
                  tile poke farm.
                </p>
              </div>
            </div>
            <div className="xl:w-1/3 md:w-1/2 p-4">
              <div className="border border-gray-200 p-6 rounded-lg">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                  </svg>
                </div>
                <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                  SCHEDULE DETAILS
                </h2>
                <p className="leading-relaxed text-base">
                  Fingerstache flexitarian street art 8-bit waist co, subway
                  tile poke farm.
                </p>
              </div>
            </div>
            <div className="xl:w-1/3 md:w-1/2 p-4">
              <div className="border border-gray-200 p-6 rounded-lg">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                  BUDGET DETAILS
                </h2>
                <p className="leading-relaxed text-base">
                  Fingerstache flexitarian street art 8-bit waist co, subway
                  tile poke farm.
                </p>
              </div>
            </div>
            <div className="xl:w-1/3 md:w-1/2 p-4">
              <div className="border border-gray-200 p-6 rounded-lg">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                  Special stock: (Currently still in stock)
                </h2>

                <div className="p-4">
                  <Pie
                    data={{
                      labels: specialstk.map((stock) => stock["material-code"]),
                      datasets: [
                        {
                          backgroundColor: [
                            "rgb(12, 121, 11)",
                            "rgb(120,1,11)",
                            "rgb(1,12,55)",
                            "rgb(55,55,55)",
                          ],
                          borderColor: "rgb(255, 99, 132)",
                          data: specialstk.map((stock) => stock["stock-val"]),
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
                <p className="leading-relaxed text-base">
                  {specialstk.map((row, index) => (
                    <p key={index}>
                      {" "}
                      <span className="text-blue-800 font-Lato">
                        {row["material-code"]}
                      </span>{" "}
                      <span className="font-semibold text-gray-400">
                        {" "}
                        Qty: {row["stock-qty"].$numberDecimal}{" "}
                      </span>{" "}
                      <span className="text-red-900">
                        {" "}
                        <span className="mr-1 text-sm">Value SAR </span>{" "}
                        <span className="text-sm  font-semibold">
                          {row["stock-val"]}
                        </span>
                      </span>
                    </p>
                  ))}
                </p>
              </div>
            </div>
            <div className="xl:w-1/3 md:w-1/2 p-4">
              <div className="border border-gray-200 p-6 rounded-lg">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="6" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"></path>
                  </svg>
                </div>
                <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                  Purchase Orders for: {project["project-wbs"]}
                </h2>
                <p className="leading-relaxed text-base">
                  <div className="overflow-x-auto relative">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="py-3 px-1">
                            PO Number & Item
                          </th>

                          <th scope="col" className="py-3 px-1 text-teal-800">
                            Unit Price
                          </th>
                          <th scope="col" className="py-3 px-1">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseorders.map((purchase, index) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 ? "bg-red-50" : null
                            } border-b dark:bg-gray-900 dark:border-gray-700`}
                          >
                            <th
                              scope="row"
                              className="flex flex-col py-4 px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                              <p className="text-[12px] text-blue-900 font-Montserrat font-semibold">
                                {purchase["po-number"]} -{" "}
                                {purchase["po-line-item"]}
                              </p>
                              <p className="text-[10px] text-purple-700">
                                {moment(purchase["po-date"]).format(
                                  "MM-DD-YYYY"
                                )}
                              </p>
                              <p className="text-[10px] text-teal-700">
                                {purchase["vendorname"]}
                              </p>
                              <p className="text-[10px] text-teal-700">
                                {purchase["material"]["matcode"]}{" "}
                                <span className="text-teal-900">
                                  {purchase["material"]["matdescription"]}
                                </span>
                              </p>
                            </th>

                            <td className="py-4 px-1 text-teal-900 font-bold text-[10px]">
                              {purchase["po-unit-price"]} <br />
                              <span className="text-[8px] text-red-800">
                                {purchase["currency"]}{" "}
                              </span>
                            </td>
                            <td className="justify-self-center  text-red-800">
                              {" "}
                              {Math.round(
                                purchase["po-quantity"].$numberDecimal,
                                0
                              )}{" "}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </p>
              </div>
            </div>
            <div className="xl:w-1/3 md:w-1/2 p-4">
              <div className="border border-gray-200 p-6 rounded-lg">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className="text-lg text-gray-900 font-medium title-font mb-2">
                  Open PR : {project["project-wbs"]}
                </h2>
                <p className="leading-relaxed text-base">
                  <div className="overflow-x-auto relative">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="py-3 px-1">
                            PR Number & Item
                          </th>

                          <th scope="col" className="py-3 px-1">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {openrequisitions.map((purchase, index) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 ? "bg-red-50" : null
                            } border-b dark:bg-gray-900 dark:border-gray-700`}
                          >
                            <th
                              scope="row"
                              className="flex flex-col py-4 px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                              <p className="text-[12px] text-blue-900 font-Montserrat font-semibold">
                                {purchase["pur-requisition"]} -{" "}
                                {purchase["pr-itemno"]}
                              </p>
                              <p className="text-[10px] text-purple-700">
                                {moment(purchase["pr-rel-date"]).format(
                                  "MM-DD-YYYY"
                                )}
                              </p>

                              <p className="text-[10px] text-teal-700">
                                {purchase["materialcode"]}{" "}
                                <span className="text-teal-900">
                                  {purchase["matdescription"]}
                                </span>
                              </p>
                            </th>

                            <td className="justify-self-center  text-red-800">
                              {" "}
                              {Math.round(
                                purchase["pr-quantity"].$numberDecimal,
                                0
                              )}{" "}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </p>
              </div>
            </div>
            
          </div>
          {/* <button className="flex mx-auto mt-16 text-white bg-pink-500 border-0 py-2 px-8 focus:outline-none hover:bg-pink-600 rounded text-lg">
            EDIT
          </button> */}
        </div>
      </section>
    </div>
  );
}

export default Projectdetails;

import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

function Materials() {
  const [materials, setmaterials] = useState({});
  const [purchases, setPurchases] = useState([]);
  const [completestock, setCompletestock] = useState({});
  const [specialStock, setSpecialstock] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [matdocs, setMatdocs] = useState([])

  let materialcode = "10303176";

  const { data: session } = useSession();

  useEffect(() => {
    const fetchMaterials = async () => {
      const response = await fetch(`/api/materials/${materialcode}`);
      const json = await response.json();
      setmaterials(json);
    };
    fetchMaterials();
  }, [materialcode]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const response = await fetch(`/api/purchaseorders/${materialcode}`);
      const json = await response.json();
      setPurchases(json);
    };
    fetchPurchases();
  }, [materialcode]);

  useEffect(() => {
    const fetchSpecialStock = async () => {
      const response = await fetch(`/api/specialstock/${materialcode}`);
      const json = await response.json();
      setSpecialstock(json);
    };
    fetchSpecialStock();
  }, [materialcode]);

  useEffect(() => {
    const fetchCompleteStock = async () => {
      const response = await fetch(`/api/completestock/${materialcode}`);
      const json = await response.json();
      setCompletestock(json);
    };
    fetchCompleteStock();
  }, [materialcode]);

  useEffect(() => {
    const fetchRequisitions = async () => {
      const response = await fetch(`/api/openrequisitions/${materialcode}`);
      const json = await response.json();
      setRequisitions(json);
    };
    fetchRequisitions();
  }, [materialcode]);

  useEffect(() => {
    const fetchMatdocs = async () => {
      const response = await fetch(`/api/materialdocuments/${materialcode}`);
      const json = await response.json();
      setMatdocs(json);
    };
    fetchMatdocs();
  }, [materialcode]);

  // console.log(materials);
  // console.log(purchases);
  // console.log(completestock);
  // console.log(specialStock);
  // console.log(session)
  // console.log(matdocs)

  let labelsBar = [...new Set(matdocs.map(item => item["doc-date"].split("-")[0]))]

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col border-b  border-slate-600 shadow-outer  my-4 bg-gradient-to-r from-cyan-100 to-amber-100">
          <div className="h-1 bg-gray-200 rounded overflow-hidden">
            <div className="w-24 h-full bg-blue-500"></div>
          </div>
          <div className="flex flex-nowrap sm:flex-row flex-col py-2 mb-1">
            <h1 className="sm:w-2/6 text-gray-900 font-medium title-font text-xl mb-2 sm:mb-0">
              {materials["material-description"]}
            </h1>
            <h2 className="sm:w-1/6 text-amber-900 text-lg font-bold mb-2 sm:mb-0 pr-3">
              {" "}
              {materials["unit-measure"]}{" "}
            </h2>
            <h5 className="sm:w-1/6 text-green-900 text-lg tracking-widest bold font-Rampart">
              {" "}
              {materials["material-type"] == "ZCVL"
                ? "Civil Material"
                : "Piping Material"}
            </h5>
            <p className="sm:w-2/6 leading-relaxed text-lg font-Freehand text-gray-600  sm:pl-10 pl-0">
              this is long text describing the material in more detail.
              Currently the material master is not maintaining the view of the
              material text, so a dummy long text is used as boilerplate
              template.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <Image
                width="100%"
                height="100%"
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/images/purchaseorder.jpg"
              />
            </div>
            <h2 className="text-md font-medium border-2 border-grey rounded-lg p-3 text-gray-900 mt-5 flex align-middle justify-center mb-3">
              Purchase Orders for: {materials["material-code"]}
            </h2>
            <div className="p-3 w-full max-w-md bg-white rounded-lg border shadow-md sm:p-2 dark:bg-gray-800 dark:border-gray-700">
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
                    {purchases.map((purchase, index) => (
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
                            {purchase["po-number"]} - {purchase["po-line-item"]}
                          </p>
                          <p className="text-[10px] text-purple-700">
                            {moment(purchase["po-date"]).format("MM-DD-YYYY")}
                          </p>
                          <p className="text-[10px] text-teal-700">
                            {purchase["vendorname"]}
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
            </div>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-sm h-64 overflow-hidden">
              <Image
                width="100%"
                height="100%"
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/images/projects.jpg"
              />
            </div>
            <h2 className="text-md font-medium border-[2px] border-grey rounded-lg p-3 text-gray-900 mt-5 flex align-middle justify-center mb-3">
              Account assignments for: {materials["material-code"]}
            </h2>
            <div className="p-3 w-full max-w-md bg-white rounded-lg border shadow-md sm:p-2 dark:bg-gray-800 dark:border-gray-700">
              <div>
                {Object.entries(
                  purchases.reduce(
                    (next, purchase) => (
                      purchase.account["order"]
                        ? (next[purchase.account["order"]] =
                            ++next[purchase.account["order"]] || 1)
                        : purchase.account["wbs"]
                        ? (next[purchase.account["wbs"]] =
                            ++next[purchase.account["wbs"]] || 1)
                        : purchase.account["costcenter"]
                        ? (next[purchase.account["costcenter"]] =
                            ++next[purchase.account["costcenter"]] || 1)
                        : null,
                      next
                    ),
                    {}
                  )
                ).map((row, index) => (
                  <p key={index} className="pb-3 flex flex-col">
                    {" "}
                    <span className="text-red-400 text-lg font-Freehand">
                      {" "}
                      {row[1]} {row[1] == 1 ? "time\u00a0 for" : "times for"}
                    </span>{" "}
                    <span className="text-purple-900  text-sm"> {row[0]}</span>{" "}
                  </p>
                ))}
              </div>
              <p className="text-sm leading-relaxed mt-2 font-bold">
                <span className="word-break pt-3 pb-3 text-amber-800 uppercase font-Lato text-xs">
                  {" "}
                  Total value of this material purchased:{" "}
                </span>
                {purchases
                  .reduce(
                    (acc, purchase) => acc + purchase["po-value-sar"],
                    0.0
                  )
                  .toLocaleString("en-US")}
                <span> {purchases[0]?.currency} </span>
              </p>

              <p className="text-sm leading-relaxed mt-2 font-bold">
                <span className="word-break pt-3 pb-3 text-amber-800 uppercase text-xs">
                  {" "}
                  Total QUANTITY of this material purchased:{" "}
                </span>
                {purchases.reduce(
                  (acc, purchase) =>
                    acc + Number(purchase["po-quantity"].$numberDecimal),
                  0
                )}
                <span> {materials["unit-measure"]}</span>
              </p>
            </div>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <Image
                width="100%"
                height="100%"
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/images/suppliers.jpg"
              />
            </div>
            <h2 className="text-md font-medium border-[2px] border-grey rounded-lg p-3 text-gray-900 mt-5 flex align-middle justify-center mb-3">
              Vendors for: {materials["material-code"]}
            </h2>
            <div className="p-3 w-full max-w-md bg-white rounded-lg border shadow-md sm:p-2 dark:bg-gray-800 dark:border-gray-700">
              {Object.entries(
                purchases.reduce(
                  (next, purchase) => (
                    (next[purchase.vendorname] =
                      ++next[purchase.vendorname] || 1),
                    next
                  ),
                  {}
                )
              ).map((row, index) => (
                <p key={index} className="flex flex-col">
                  {" "}
                  <span className="text-red-400 font-Freehand text-lg pb-3">
                    {row[1]} {row[1] == 1 ? `time\u00a0 from` : "times from"}{" "}
                  </span>{" "}
                  <span className="text-sm font-semibold">{row[0]}</span>{" "}
                </p>
              ))}
            </div>

            <h2 className="text-md border-[2px] border-grey rounded-lg p-3 font-medium   text-gray-900 mt-5 flex align-middle justify-center mb-3">
              Open requisitions for:{" "}
              <span className=" px-3 text-amber-900">
                {materials["material-code"]}{" "}
              </span>
            </h2>
            <div className="p-3 w-full max-w-md bg-white rounded-lg border shadow-md sm:p-2 dark:bg-gray-800 dark:border-gray-700">
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
                    {requisitions.map((requisition, index) => (
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
                          <p className="text-[12px] text-blue-900 font-Montserrat tracking-widest font-semibold">
                            {requisition["pur-requisition"]} -{" "}
                            {requisition["pr-itemno"]}
                          </p>
                          <p className="text-[10px] text-purple-700">
                            {moment(requisition["pr-date"]).format(
                              "MM-DD-YYYY"
                            )}
                          </p>
                        </th>

                        <td className="justify-self-center  text-red-800">
                          {" "}
                          {Math.round(
                            requisition["pr-quantity"].$numberDecimal,
                            0
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* third section */}

        <section className="text-gray-600 body-font">
          <div className="container px-5 py-24 mx-auto">
            <div className="flex flex-col text-center w-full mb-20">
              <h2 className="text-md text-blue-500 tracking-widest font-medium title-font mb-1">
                Material Stock and Trend
              </h2>
              <h1 className="sm:text-2xl text-xl font-medium title-font text-gray-900">
                {materials["material-description"]}
              </h1>
            </div>
            <div className="flex flex-wrap -m-4">
              <div className="p-4 md:w-1/3">
                <div className="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <h2 className="text-gray-900 text-lg title-font font-medium">
                      Stock, receipts and consumption
                    </h2>
                  </div>
                  <div className="flex-grow pt-9">
                    <Bar
                      data={{
                        labels: ["Stock", "Total Receipts", "Total Issues"],
                        datasets: [
                          {
                            label: `${materials["material-code"]}`,
                            backgroundColor: "rgb(122, 123, 255)",
                            borderColor: "rgb(255, 99, 132)",
                            data: [
                              `${completestock["current-stkval"]}`,
                              `${completestock["receipt-val"]}`,
                              `${completestock["issue-val"]}`,
                            ],
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 md:w-1/3">
                <div className="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <h2 className="text-gray-900 text-lg title-font font-medium">
                      Special Stock
                    </h2>
                  </div>
                  <div className="flex-grow">
                    <Pie
                      data={{
                        labels: specialStock.map(
                          (stock) => stock["wbs-element"]
                        ),
                        datasets: [
                          {
                            backgroundColor: "rgb(12, 121, 11)",
                            borderColor: "rgb(255, 99, 132)",
                            data: specialStock.map(
                              (stock) => stock["stock-val"]
                            ),
                          },
                        ],
                        options: {
                          responsive: true,
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 md:w-1/3">
                <div className="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="6" cy="6" r="3"></circle>
                        <circle cx="6" cy="18" r="3"></circle>
                        <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"></path>
                      </svg>
                    </div>
                    <h2 className="text-gray-900 text-lg title-font font-medium">
                      Year-wise trends 
                    </h2>
                  </div>
                  <div className="flex-grow">
                                  
                    <p>
                      
                    <Bar
                      data={{
                        labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
                        datasets: [
                          {
                            label: "issues to projects",
                            backgroundColor: "rgb(128, 0, 0)",
                            borderColor: "rgb(255, 99, 132)",
                            data: [
                              `${matdocs.filter(
                                (row) => (row["mvt-type"] == "281" && row["doc-date"].split("-")[0] == '2017')
                              )
                                .reduce(
                                  (acc, matdoc) => acc + matdoc["doc-amount"],
                                  0.0
                                )
                                }`,
                                `${matdocs.filter(
                                  (row) => (row["mvt-type"] == "281" && row["doc-date"].split("-")[0] == '2018')
                                )
                                  .reduce(
                                    (acc, matdoc) => acc + matdoc["doc-amount"],
                                    0.0
                                  )
                                  }`,
                                  `${matdocs.filter(
                                    (row) => (row["mvt-type"] == "281" && row["doc-date"].split("-")[0] == '2019')
                                  )
                                    .reduce(
                                      (acc, matdoc) => acc + matdoc["doc-amount"],
                                      0.0
                                    )
                                    }`,
                                    `${matdocs.filter(
                                      (row) => (row["mvt-type"] == "281" && row["doc-date"].split("-")[0] == '2020')
                                    )
                                      .reduce(
                                        (acc, matdoc) => acc + matdoc["doc-amount"],
                                        0.0
                                      )
                                      }`,
                                      `${matdocs.filter(
                                        (row) => (row["mvt-type"] == "281" && row["doc-date"].split("-")[0] == '2021')
                                      )
                                        .reduce(
                                          (acc, matdoc) => acc + matdoc["doc-amount"],
                                          0.0
                                        )
                                        }`,
                                        `${matdocs.filter(
                                          (row) => (row["mvt-type"] == "281" && row["doc-date"].split("-")[0] == '2022')
                                        )
                                          .reduce(
                                            (acc, matdoc) => acc + matdoc["doc-amount"],
                                            0.0
                                          )
                                          }`
                            ],
                          },
                        ],
                      }}
                    />

                    {/* receipt bar chart */}

                    <Bar
                      data={{
                        labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
                        datasets: [
                          {
                            label: "Receipts",
                            backgroundColor: "rgb(50, 205, 50)",
                            borderColor: "rgb(255, 99, 132)",
                            data: [
                              `${matdocs.filter(
                                (row) => (row["mvt-type"] == "105"  && row["doc-date"].split("-")[0] == '2017')
                              )
                                .reduce(
                                  (acc, matdoc) => acc + matdoc["doc-amount"],
                                  0.0
                                )
                                }`,
                                `${matdocs.filter(
                                  (row) => (row["mvt-type"] == "105"  && row["doc-date"].split("-")[0] == '2018')
                                )
                                  .reduce(
                                    (acc, matdoc) => acc + matdoc["doc-amount"],
                                    0.0
                                  )
                                  }`,
                                  `${matdocs.filter(
                                    (row) => (row["mvt-type"] == "105"  && row["doc-date"].split("-")[0] == '2019')
                                  )
                                    .reduce(
                                      (acc, matdoc) => acc + matdoc["doc-amount"],
                                      0.0
                                    )
                                    }`,
                                    `${matdocs.filter(
                                      (row) => (row["mvt-type"] == "105"   && row["doc-date"].split("-")[0] == '2020')
                                    )
                                      .reduce(
                                        (acc, matdoc) => acc + matdoc["doc-amount"],
                                        0.0
                                      )
                                      }`,
                                      `${matdocs.filter(
                                        (row) => (row["mvt-type"] == "105"  && row["doc-date"].split("-")[0] == '2021')
                                      )
                                        .reduce(
                                          (acc, matdoc) => acc + matdoc["doc-amount"],
                                          0.0
                                        )
                                        }`,
                                        `${matdocs.filter(
                                          (row) => (row["mvt-type"] == "105"  && row["doc-date"].split("-")[0] == '2022')
                                        )
                                          .reduce(
                                            (acc, matdoc) => acc + matdoc["doc-amount"],
                                            0.0
                                          )
                                          }`

                                
                            ],
                          },
                        ],
                      }}
                    />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: { session }
  }
}

export default Materials;

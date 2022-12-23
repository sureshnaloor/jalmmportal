import React, { useState, useEffect } from "react";
import moment from 'moment'
import {motion} from 'framer-motion'


function Vendor() {
  const [vendors, setVendors] = useState([]);

  const [polist, setPolist] = useState([]);

  const [CurrentPurchaseorder, setCurrentPurchaseorder] = useState(null);

  const [selectedpolist, setSelectedpolist] = useState([]);

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchselectedPolist = async () => {
      setLoading(true);
      const response = await fetch(
        `/api/purchaseorders/porder/${CurrentPurchaseorder}`
      );
      const json = await response.json();
      setSelectedpolist(json);
      setLoading(false);
    };
    fetchselectedPolist();
  }, [CurrentPurchaseorder]);

  useEffect(() => {
    const fetchVendors = async () => {
      const response = await fetch(`/api/vendors`);
      const json = await response.json();
      setVendors(json);
    };
    fetchVendors();
  }, []);

  console.log(vendors);

  let projectid = "IS%2FGP.22.001";

  useEffect(() => {
    const fetchPolist = async () => {
      const response = await fetch(
        `/api/purchaseorders/project/consolidated/${projectid}`
      );
      const json = await response.json();
      setPolist(json);
    };
    fetchPolist();
  }, [projectid]);

  const setActivePo = (ponum, index) => {
    setCurrentPurchaseorder(ponum);
    
  };

  const variant = {
    hidden:{
      scale:0.9,
      opacity:0.5,
      color:""
    },
    visible:{
      scale:1.0,
      opacity:1,
            transition:{
        delay:0.3
      }
    }
  }

  return (
    <div className="bg-white py-2 sm:py-3 lg:py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="sm:text-center">
          
          <h2 className="text-lg font-semibold leading-8 text-indigo-600 pb-9">
            Vendors in SAP
          </h2>
          
          
          <div className="flex overflow-x-scroll pb-10 hide-scroll-bar">
            <div className="flex flex-nowrap lg:ml-40 md:ml-20 ml-10 ">
              {vendors.map((vendor, index) => (
                <div
                  key={index}
                  className="inline-block px-3"                  
                >
                  <div className="w-64 h-60 max-w-xs overflow-hidden rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <div className="flex justify-center">
                      <div className="block rounded-lg shadow-lg bg-white max-w-sm text-center"
                      
                      >
                        <div className="py-3 px-6 border-b bg-blue-50 border-gray-300">
                          {vendor["vendor-code"]}
                        </div>
                        <div className="p-6 bg-slate-100">
                          <h5 className="text-gray-900 text-sm font-medium mb-[2px]">
                            {vendor["vendor-name"]}
                          </h5>
                          <p className="text-emerald-900 text-[8px] mb-[1px]">
                            {vendor.address["street"]}
                          </p>
                          <span className="text-blue-900 text-[8px]">
                            Zipcode: {vendor.address["zipcode"]} ,
                          </span>
                          <span className="text-red-900 font-bold text-[8px]">
                            {vendor.address["city"]} ,{" "}
                            {vendor.address["countrycode"]} ,
                          </span>
                          <span className="text-gray-900 text-[8px]">
                            PO Box: {vendor.address["pobox"]}
                          </span>
                        </div>
                        <div className="py-3 px-6  bg-orange-100 border-t border-gray-300 text-gray-600 text-xs">
                          Created: {moment(vendor["created_date"]).fromNow()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div classNameName="w-32 h-32 max-w-xs overflow-hidden rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out"></div> */}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 max-w-lg sm:mx-auto md:max-w-none">
            <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-16">
              <div className="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white sm:shrink-0"> */}
                {/* <!-- Heroicon name: outline/globe-alt --> */}
                {/* <svg
                  className="h-8 w-8"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg> */}
                {/* </div> */}
                {/* <div className="sm:min-w-0 sm:flex-1">
                <p className="text-lg font-semibold leading-8 text-gray-900">
                  Competitive exchange rates
                </p>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Maiores impedit perferendis suscipit eaque, iste dolor
                  cupiditate blanditiis ratione.
                </p>
              </div> */}
                <div className="flex flex-col container mx-auto">
                  <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block min-w-full sm:px-3 lg:px-8">
                      <div className="overflow-hidden">
                        <table className="min-w-full">
                          <thead className="bg-white border-b">
                            <tr>
                              <th
                                scope="col"
                                className="text-[10px] font-medium text-gray-900 px-3 py-4 text-left"
                              >
                                #
                              </th>
                              <th
                                scope="col"
                                className="text-[10px] font-medium text-gray-900 px-3 py-4 text-left"
                              >
                                PO Number
                              </th>
                              <th
                                scope="col"
                                className="text-[10px] font-medium text-gray-900 px-3 py-4 text-left"
                              >
                                Vendor
                              </th>
                              <th
                                scope="col"
                                className="text-[10px] font-medium text-gray-900 px-3 py-4 text-left"
                              >
                                PO Value
                              </th>

                              <th
                                scope="col"
                                className="text-[10px] font-medium text-gray-900 px-3 py-4 text-left"
                              >
                                Pending PO Value
                              </th>

                              <th
                                scope="col"
                                className="text-[10px] font-medium text-gray-900 px-3 py-4 text-left"
                              >
                                PO Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {polist
                              .sort((a, b) =>
                                a.poval < b.poval
                                  ? 1
                                  : a.poval > b.poval
                                  ? -1
                                  : 0
                              )
                              .map((row, index) => (
                                <tr
                                  key={index}
                                  className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100"
                                  onClick={() => {
                                    setActivePo(row.ponum, index);
                                    console.log("I am clicked!")
                                  }}
                                >
                                  <td className="px-1 py-1 whitespace-nowrap text-[8px] font-medium text-gray-900">
                                    {index + 1}
                                  </td>
                                  <td className="text-[10px] text-gray-900 font-semibold px-1 py-1 whitespace-nowrap">
                                    {row.ponum}
                                  </td>
                                  <td className="text-[14px] text-gray-900 font-light px-2 py-1 whitespace-nowrap">
                                    {row.vendor}
                                  </td>
                                  <td className="text-[10px] text-gray-900 font-semibold px-2 py-1 whitespace-nowrap">
                                    {(
                                      Math.round(row.poval * 100) / 100
                                    ).toLocaleString()}
                                  </td>

                                  <td className="text-[10px] text-gray-900 font-semibold px-2 py-1 whitespace-nowrap">
                                    {(
                                      Math.round(row.balgrval * 100) / 100
                                    ).toLocaleString()}
                                  </td>

                                  <td className="text-[10px] text-gray-800 font-semibold px-2 py-1 whitespace-nowrap">
                                    {moment(row.podate).format("MM-DD-YYYY")}
                                  </td>
                                  {/* <td> */}
                                  {/* <p className="md:space-x-1 space-y-1 md:space-y-0 mb-4">
                          <button
                            className="inline-block px-3 py-1.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseExample"
                            aria-expanded="false"
                            aria-controls="collapseExample"
                            onClick={() => {
                            //   setShowModal(true);
                            //   setActivePo(row.ponum, index)
                            }
                          }
                          >
                            Details
                          </button>
                        </p> */}
                                  {/* </td> */}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white sm:shrink-0"> */}
                {/* <!-- Heroicon name: outline/scale --> */}
                {/* <svg
                  className="h-8 w-8"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                > */}
                {/* <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
                  />
                </svg> */}
                {/* </div> */}
                {/* <div className="sm:min-w-0 sm:flex-1">
                <p className="text-lg font-semibold leading-8 text-gray-900">
                  No hidden fees
                </p>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Maiores impedit perferendis suscipit eaque, iste dolor
                  cupiditate blanditiis ratione.
                </p>
              </div> */}
                {/* <div className="fixed top-0 left-0 h-full w-full bg-slate-400 bg-opacity-10 backdrop-blur-0 flex justify-center items-center"> */}
                
                  <div className="w-[900px] flex flex-col">
                  
                    <div className="bg-white p-2 rounded text-[12px] text-black font-semibold">
                    
                      
                      PO Details for:{CurrentPurchaseorder}{" "}
                      
                      {!isLoading ? (
                        <motion.div initial="hidden" animate="visible" variants={variant}>
                        <div className="flex flex-col">
                          <div className="overflow-y-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                              <div className="overflow-y-auto">
                                <table className="min-w-full text-center">
                                  <thead className="border-b bg-white">
                                    <tr>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        PO Line Item
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        Plant Code
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        PO Quantity
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        PO UOM
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        PO Unit Price
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        PO Item Value (SR)
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        Pending Qty
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-[10px] font-medium text-gray-900 px-6"
                                      >
                                        Pending Value (SR)
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody >
                                    {selectedpolist.map((row, index) => (
                                      <tr
                                        key={index}
                                        className="bg-slate-400  border-b"
                                      >
                                        <td className="px-6 whitespace-nowrap text-[10px] font-medium text-white">
                                          {row["po-line-item"]}
                                        </td>
                                        <td className="text-[10px] text-white font-light px-6 max-h-full whitespace-nowrap">
                                          {row["plant-code"]}
                                        </td>
                                        <td className="text-[10px] text-white font-medium px-6 max-h-full whitespace-nowrap">
                                          {row["po-quantity"].$numberDecimal}
                                        </td>
                                        <td className="text-[10px] text-white font-light px-6 max-h-full whitespace-nowrap">
                                          {row["po-unit-of-measure"]}
                                        </td>
                                        <td className="text-[10px] text-white font-medium px-6 max-h-full whitespace-nowrap">
                                          {row["po-unit-price"]}
                                        </td>
                                        <td className="text-[10px] text-white font-light px-6 max-h-full whitespace-nowrap">
                                          {row["po-value-sar"]}
                                        </td>
                                        <td className="text-[10px] text-white font-medium px-6 max-h-full whitespace-nowrap">
                                          {row["pending-qty"].$numberDecimal}
                                        </td>
                                        <td className="text-[10px] text-white font-light px-6 max-h-full whitespace-nowrap">
                                          {row["pending-val-sar"]}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                        </motion.div>
                      ) : (
                        <div className=" bg-white">
                          <div className="flex justify-center items-center h-full">
                            <img
                              className="h-16 w-16"
                              src="https://icons8.com/preloaders/preloaders/1488/Iphone-spinner-2.gif"
                              alt=""
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                {/* </div> */}
                
              </div>

              <div className="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white sm:shrink-0">
                  {/* <!-- Heroicon name: outline/bolt --> */}
                  <svg
                    className="h-8 w-8"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                
                  <p className="text-lg font-semibold leading-8 text-gray-900">
                    Transfers are instant
                  </p>
                  
                  <p className="mt-2 text-base leading-7 text-gray-600">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Maiores impedit perferendis suscipit eaque, iste dolor
                    cupiditate blanditiis ratione.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white sm:shrink-0">
                  {/* <!-- Heroicon name: outline/device-phone-mobile --> */}
                  <svg
                    className="h-8 w-8"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <p className="text-lg font-semibold leading-8 text-gray-900">
                    Mobile notifications
                  </p>
                  <p className="mt-2 text-base leading-7 text-gray-600">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Maiores impedit perferendis suscipit eaque, iste dolor
                    cupiditate blanditiis ratione.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vendor;

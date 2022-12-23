import React, { Component } from "react";
import { useState, useEffect } from "react";
import Modal from './modal'
import {motion} from 'framer-motion'

import moment from "moment";

const Vendor = () => {
  const [polist, setPolist] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [CurrentPurchaseorder, setCurrentPurchaseorder] = useState(null);

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

  console.log(polist);

  const setActivePo = (ponum, index) => {
    setCurrentPurchaseorder(ponum);
    
  };

  const spring = {
    type: 'spring',
    stiffness: 700,
    damping: 30,
}

  return (
    <div>
    <motion.div
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/90"
                layout
                transition={spring}
            ></motion.div>
    
      <div className="flex flex-col container mx-auto ">
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
                  {polist.map((row, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100"
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-[10px] font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="text-[10px] text-gray-900 font-semibold px-3 py-4 whitespace-nowrap">
                        {row.ponum}
                      </td>
                      <td className="text-[10px] text-gray-900 font-light px-3 py-4 whitespace-nowrap">
                        {row.vendor}
                      </td>
                      <td className="text-xs text-gray-900 font-semibold px-3 py-4 whitespace-nowrap">
                        {Math.round(row.poval * 100) / 100}
                      </td>

                      <td className="text-xs text-gray-900 font-semibold px-3 py-4 whitespace-nowrap">
                        {Math.round(row.balgrval * 100) / 100}
                      </td>

                      <td className="text-xs text-gray-800 font-semibold px-3 py-4 whitespace-nowrap">
                        {moment(row.podate).format("MM-DD-YYYY")}
                      </td>
                      <td>
                        <p className="md:space-x-1 space-y-1 md:space-y-0 mb-4">
                          <button
                            className="inline-block px-3 py-1.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseExample"
                            aria-expanded="false"
                            aria-controls="collapseExample"
                            onClick={() => {
                              setShowModal(true);
                              setActivePo(row.ponum, index)
                            }
                          }
                          >
                            Details
                          </button>
                        </p>
                      </td>
                      <td>
                      <Modal isVisible={showModal} CurrentPurchaseorder={CurrentPurchaseorder} onClose={()=> setShowModal(false)}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendor;

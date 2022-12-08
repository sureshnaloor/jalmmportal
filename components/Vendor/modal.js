import React from "react";
import { useEffect, useState } from "react";

function Modal({ isVisible, CurrentPurchaseorder, onClose }) {
  const [polist, setPolist] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolist = async () => {
      setLoading(true);
      const response = await fetch(
        `/api/purchaseorders/porder/${CurrentPurchaseorder}`
      );
      const json = await response.json();
      setPolist(json);
      setLoading(false);
    };
    fetchPolist();
  }, [CurrentPurchaseorder]);

  console.log(polist);

  if (!isVisible) return null;
  return (
    <div className="fixed top-0 left-0 h-full w-full bg-slate-400 bg-opacity-10 backdrop-blur-0 flex justify-center items-center">
      <div className="w-[900px] flex flex-col">
        <button
          className="text-white text-xl place-self-end "
          onClick={() => onClose()}
        >
          
          X
        </button>
        <div className="bg-white  p-2 rounded text-[10px]">
          {" "}
          PO Details for:{CurrentPurchaseorder}
          
            {" "}
            {!isLoading ? (
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
                        <tbody>
                          {polist.map((row, index) => (
                            <tr key={index} className="bg-slate-50 border-b">
                              <td className="px-6 whitespace-nowrap text-[10px] font-medium text-gray-900">
                                {row["po-line-item"]}
                              </td>
                              <td className="text-[10px] text-gray-900 font-light px-6 max-h-full whitespace-nowrap">
                                {row["plant-code"]}
                              </td>
                              <td className="text-[10px] text-gray-900 font-light px-6 max-h-full whitespace-nowrap">
                                {row["po-quantity"].$numberDecimal}
                              </td>
                              <td className="text-[10px] text-gray-900 font-light px-6 max-h-full whitespace-nowrap">
                                {row["po-unit-of-measure"]}
                              </td>
                              <td className="text-[10px] text-gray-900 font-light px-6 max-h-full whitespace-nowrap">
                                {row["po-unit-price"]}
                              </td>
                              <td className="text-[10px] text-gray-900 font-light px-6 max-h-full whitespace-nowrap">
                                {row["po-value-sar"]}
                              </td>
                              <td className="text-[10px] text-gray-900 font-light px-6 max-h-full whitespace-nowrap">
                                {row["pending-qty"].$numberDecimal}
                              </td>
                              <td className="text-[10px] text-gray-900 font-light px-6 max-h-full whitespace-nowrap">
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
    </div>
  );
}

export default Modal;

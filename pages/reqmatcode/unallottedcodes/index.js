import React, { useState, useEffect } from "react";

import { useSession } from "next-auth/react";
import moment from "moment";

import { getSession } from "next-auth/react";

function Unallottedcodes() {
  const { data: session } = useSession();

  const [unallottedRequests, setUnallottedrequests] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/reqmatcode/unallotted`);
      const json = await result.json();
      setUnallottedrequests(json);
    })();
  }, []);

  return (
    <>
      <div className="flex mt-6 justify-center align-middle ml-3">
        <div className="bg-amber-200 mx-auto w-[90%] min-h-[80vh] min-w-[80vw] p-3">
        <div className="bg-zinc-100 w-full p-3">
              <table className="w-full  text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-1">
                      Request number:
                    </th>

                    <th scope="col" className="px-1">
                      Brief description & UOM:
                    </th>
                    <th scope="col" className="px-1">
                      Long description
                    </th>
                    <th scope="col" className="px-1">
                      Requested on:
                    </th>
                    <th scope="col" className="px-1">
                      Mat type, Primary Matgroup, Secondary Matgroup
                    </th>
                    
                  </tr>
                </thead>
                <tbody>
                  {unallottedRequests.map((mreq, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 ? "bg-red-50" : null
                      } border-b dark:bg-gray-900 dark:border-gray-700`}
                    >
                      <th
                        scope="row"
                        className="font-medium text-gray-900 whitespace-nowrap dark:text-white "
                      >
                        <p className="text-[12px] text-blue-900 font-Montserrat font-semibold mx-auto">
                          {mreq._id}
                        </p>
                      </th>
                      <th
                        scope="row"
                        className="font-medium text-gray-900 whitespace-nowrap dark:text-white mx-auto"
                      >
                        <p className="text-[12px] text-blue-900 font-Montserrat font-semibold">
                          {mreq.newdescription}
                        </p>
                        <p className="text-[12px] font-black text-stone-900 font-Montserrat mx-auto">
                          {" "}
                          {mreq.uom}{" "}
                        </p>
                      </th>
                      <th
                        scope="row"
                        className="py-4 px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <p
                          className="text-[12px] text-blue-900 font-Montserrat font-semibold"
                          dangerouslySetInnerHTML={{ __html: mreq.longDesc }}
                        ></p>
                      </th>
                      <th
                        scope="row"
                        className="py-4 px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <p className="text-[12px] text-blue-900 font-Montserrat font-semibold">
                          {moment(mreq.created_at).format("DD/MM/YYYY")}
                        </p>
                      </th>
                      <th
                        scope="row"
                        className="flex flex-col py-4 px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <p className="text-[12px] text-blue-900 font-Montserrat font-semibold">
                          {mreq.mattypeselected}
                        </p>
                        <p className="text-[12px] text-blue-900 font-Montserrat font-semibold">
                          {mreq.matgroupselected}
                        </p>
                        <p className="text-[12px] text-blue-900 font-Montserrat font-semibold">
                          {mreq.secondarymatgroupselected}
                        </p>
                      </th>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </>
  );
}



export default Unallottedcodes;

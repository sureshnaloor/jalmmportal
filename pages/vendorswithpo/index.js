import React from "react";
// import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import {useRouter} from 'next/router'

// import moment from 'moment'
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";
import Tablecomponent, {
  SelectColumnFilter,
  Boldstyle1,
  Boldstyle2,
  Boldstyle3,
  Boldstyle4,
  Numberstyle
} from "../../components/Tablecomponent";

import Purchaseorderschedule  from "../../components/Purchaseorderschedule";
// import { useSession } from "next-auth/react";

function Vendorswithpo() {
  const router = useRouter();

  const [selectedVendor, setSelectedVendor] = useState({});
  // const [editmode, setEditmode] = useState(false);


  function handleEdit(row) {
    const vendor = row.row.values;
    // setEditmode(true)
    console.log(vendor);
    // console.log(editmode)
    // setSelectedopenpo({ ...ponumber, "_id.po-number" });
    // setShowModal(true);
    // router.push(`/openpurchaseorders/podetailedsch?ponumber=${ponumber["_id.po-number"]}`)
    router.push(`/vendorswithpo/vendorevaluation?vendornumber=${vendor["vendor-code"]}`)
  }

  

  const columns = useMemo(
    () => [
      // first group - TV Show
      // Header: `List of materials in group ${matgroupid}`,
      // First group columns
      // columns: [
      {
        Header: "Vendor Number",
        accessor: "vendor-code",
        Cell: Boldstyle3,
        Filter: SelectColumnFilter,
      },
      {
        Header: "Vendor Name",
        accessor: "vendor-name",
        Cell: Boldstyle4,
      },
     
      
      {
        Header: "Action",
        accesor: "action",
        Cell: (row) => (
          <div className="bg-blue-500 hover:bg-blue-700 text-white text-[14px] font-bold py-2 px-4 rounded">
            
              <button onClick={(e) => handleEdit(row)}> Vendor Eval.score </button>
            
          </div>
        ),
      },
    ],

    // ],
    []
  );

  const [vendorlist, setVendorlist] = useState([]);
  

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/vendors/vendorswithpo`);
      const json = await result.json();
      setVendorlist(json);
    })();
  }, []);

  console.log(vendorlist);
  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen bg-gray-50 text-gray-900 w-11/12 ml-9">
        <div className="mt-6">
          <p className="font-bold text-lg mb-3">
            Vendors' List who have PO's issued to them so far and hence evaluated.
          </p>
          <Tablecomponent columns={columns} data={vendorlist} />
          
          
        </div>
      </div>
      <FooterComponent />
    </>
  );
}

export default Vendorswithpo;

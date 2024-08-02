import React from "react";
// import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

// import moment from 'moment'
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";

import { getSession } from "next-auth/react";
import Tablecomponent, {
  SelectColumnFilter,
  Boldstyle1,
  Boldstyle2,
  Boldstyle3,
  Boldstyle4,
  Numberstyle,
} from "../../components/Tablecomponent";

import Purchaseorderschedule from "../../components/Purchaseorderschedule";
// import { useSession } from "next-auth/react";

function Vendorswithpo() {
  const router = useRouter();

  const [selectedVendor, setSelectedVendor] = useState({});
  // const [editmode, setEditmode] = useState(false);

  function handleEdit(row) {
    const vendor = row.row.values;
    // setEditmode(true)
    console.log(vendor);
        router.push(
      `/vendorswithpo/vendorevaluation?vendornumber=${vendor["vendor-code"]}`
    );
  }

  function handleComent(row) {
    const vendor = row.row.values;
    // setEditmode(true)
    console.log(vendor);
        router.push(
      `/registeredvendors/vendorcomments/?vendor=${vendor["vendor-name"]}`
    );
  }

  function handleMapgroup(row) {
    const vendor = row.row.values;
    // setEditmode(true)
    console.log(vendor);
        router.push(
      `/registeredvendors/vendormap/?vendor=${vendor["vendor-name"]}`
    );
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
          <div className="flex justify-around">
            {" "}
            <div className="bg-blue-500 hover:bg-blue-700 text-white text-[10px] font-bold py-2 px-1 rounded-xl mx-1">
              <button onClick={(e) => handleEdit(row)}> Evaluation </button>
            </div>
            <div className="bg-orange-500 hover:bg-orange-700 text-white text-[10px] font-bold py-2 px-1 rounded-xl mx-1">
              <button onClick={(e) => handleComent(row)}> Comments </button>
            </div>
            <div className="bg-emerald-500 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 px-1 rounded-xl mx-1">
              <button onClick={(e) => handleMapgroup(row)}>
                {" "}
                Map to group{" "}
              </button>
            </div>
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
      // const result = await fetch(`/api/vendors/vendorswithpo`);
      const result = await fetch(`/api/vendors/povendor/lastyearspofound`)
      const json = await result.json();
      setVendorlist(json);
    })();
  }, []);

  console.log(vendorlist);
  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen bg-gray-50 text-gray-900 w-full ml-1">
        <div className="mt-6">
          <p className="font-bold text-lg mb-3">
            Vendors' List who have PO's issued to them so far and hence
            evaluated.
          </p>
          <Tablecomponent columns={columns} data={vendorlist} />
        </div>
      </div>
      <FooterComponent />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default Vendorswithpo;

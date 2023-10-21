import React from "react";
// import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

import {
  ChevronDoubleRightIcon,
  HandIcon,
  Hicode,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";

// import moment from 'moment'
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";
import Tablecomponent, {
  SelectColumnFilter,
  Boldstyle1,
  Boldstyle2,
  Boldstyle3,
  Boldstyle4,
  Numberstyle,
} from "../../components/Tablecomponent";
// import Purchaseorderschedule  from "../../components/Purchaseorderschedule";
// import { useSession } from "next-auth/react";

function Openpurchaseorders() {
  const router = useRouter();

  const [selectedopenpo, setSelectedopenpo] = useState({});
  // const [editmode, setEditmode] = useState(false);

  function handleEdit(row) {
    const ponumber = row.row.values;
    // setEditmode(true)
    console.log(ponumber);
    // console.log(editmode)
    // setSelectedopenpo({ ...ponumber, "_id.po-number" });
    // setShowModal(true);
    router.push(
      `/openpurchaseorders/podetailedsch?ponumber=${ponumber["_id.po-number"]}`
    );
  }

  const [openpolist, setOpenpolist] = useState([]);
  const [poschfilled, setPoschfilled] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/purchaseorders/openpo`);
      const json = await result.json();
      setOpenpolist(
        json.filter(
          (row) =>
            row.openvalue > 1000 &&
            row._id["po-number"].substring(0, 2) !== "47" &&
            row._id["po-number"].substring(0, 2) !== "71" &&
            row._id["po-number"].substring(0, 2) !== "91"
        )
      );
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/purchaseorders/poschedulefilled`);
      const json = await result.json();
      setPoschfilled(json);
    })();
  }, []);

  // const joined = openpolist.map(rowpo => ({
  //   ...rowpo,
  //   ...poschfilled.find(rowsch => rowsch.ponumber == rowpo._id["po-number"])
  // }));

  const joined = openpolist.map((rowpo) => {
    const match = poschfilled.find(
      (rowsch) => rowsch.ponumber == rowpo._id["po-number"]
    );

    console.log(match);

    if (match) {
      const merged = {
        ...rowpo,
        ...match,
      };
      if (rowpo._id) {
        merged._id = rowpo._id;
      }

      return merged;
    } else {
      return rowpo;
    }
  });

  console.log(joined);

  const columns = useMemo(
    () => [
      {
        Header: "PO Number",
        accessor: "_id.po-number",
        Cell: Boldstyle3,
        Filter: SelectColumnFilter,
      },
      {
        Header: "Plant code",
        accessor: "_id.plant",
        Cell: Boldstyle4,
      },
      {
        Header: "Vendor code",
        accessor: "_id.vendorcode",

        Cell: Boldstyle3,
      },

      {
        Header: "Vendor name",
        accessor: "_id.vendorname",
        Filter: SelectColumnFilter,
        Cell: Boldstyle4,
      },

      {
        Header: "Open PO value",
        accessor: "openvalue",
        Cell: Numberstyle,
      },

      {
        Header: "PO Schedule",
        accesor: "action",
        Cell: (row) => (
          <div className="bg-blue-500 hover:bg-blue-700 text-white text-[14px] font-bold py-2 px-4 rounded">
            <button onClick={(e) => handleEdit(row)}> PO schedule </button>
          </div>
        ),
      },

      {
        Header: "Schedule edited?",
        accessor: (row) =>
          row?.bgdata ? (
            <SwitchHorizontalIcon className="h-6 w-6 stroke-orange-400" />
          ) : row?.bgtab ? (
            "not applicable"
          ) : null,
      },
    ],
    []
  );

  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen bg-gray-50 text-gray-900 w-11/12 ml-9">
        <div className="mt-6">
          <p className="font-bold text-lg mb-3">
            List of all open purchase orders (open line items only)
          </p>
          <Tablecomponent columns={columns} data={joined} />
        </div>
      </div>
      <FooterComponent />
    </>
  );
}

export default Openpurchaseorders;

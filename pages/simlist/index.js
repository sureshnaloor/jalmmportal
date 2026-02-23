import React from "react";
import Image from 'next/image'
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
// import moment from 'moment'
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";
import Link from 'next/link'

import { TrashIcon, CheckCircleIcon, LightBulbIcon } from "@heroicons/react/solid";


import { getSession } from "next-auth/react";

import Tablecomponent, {
  Numberstylesim,
  Boldstylesim,
  Numberstylesim1,
  Boldstylesim1,
  Normalstylesim,
  Specialstylesim,
  Spstylesim,
  simStyle,
  simStyle1,
  simStyle2,
  simStyle3,
} from "../../components/Tablecomponentsim";

import Simedit from "../../components/Simeditcomponent";

function Simlist() {
  const router = useRouter();

  const [editmode, setEditmode] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState({});

  function handleEdit(row) {
    console.log("clicked!! I am inside edit mode ");
    const account = row.row.original;
    setEditmode(true);
    // console.log(row.row.original);
    setSelectedAccount({ ...account });
    setShowModal(true);
    return null;
  }

  const columns = useMemo(
    () => [
      
      // {
      //   Header: "Account details",
      //   accessor: "type",
      //   Cell: (props) => (
      //     <h2 className="bg-zinc-100 shadow-md shadow-slate-800 px-3 font-bold border-r-8 min-h-[150px] min-w-[300px]">
      //       <div className="flex justify-between mb-1 pb-1 border-b-2 border-teal-600">
      //         <h1 className="font-black tracking-wider"> Type: </h1>{" "}
      //         <p className="text-teal-800 text-[12px] p-1 shadow-md tracking-widest font-lato font-black shadow-slate-600 border-b-2 border-red-600">
      //           {props.row.original.type}
      //         </p>
      //       </div>
      //       <div className="bg-teal-50 shadow-lg shadow-white p-3">
      //         <div className="flex justify-between pb-1">
      //           <h1 className="mb-3 font-bold text-[10px] font-Poppins tracking-wider">
      //             {" "}
      //             Account No#:{" "}
      //           </h1>
      //           <h1 className="text-stone-800 text-[12px] p-1 shadow-sm shadow-slate-200 font-black tracking-wider font-Montserrat">
      //             {" "}
      //             {props.row.original["account-number"]}
      //           </h1>
      //         </div>
      //         <div className="flex justify-between pb-1">
      //           <h1 className="mb-3 font-bold font-Poppins tracking-wider">
      //             {" "}
      //             Service No#:{" "}
      //           </h1>
      //           <h1 className="text-cyan-900 text-[12px] p-1 shadow-md shadow-slate-200 font-black tracking-wider">
      //             {props.row.original["service-number"]}
      //           </h1>
      //         </div>
      //         <div className="flex justify-between pb-1">
      //           {" "}
      //           <h1 className="mb-3 font-bold font-Poppins tracking-wider">
      //             {" "}
      //             Current Plan:
      //           </h1>
      //           <h1 className="text-stone-800 text-[12px] shadow-md shadow-slate-100 font-black pr-2">
      //             {props.row.original.plan}
      //           </h1>
      //         </div>
      //       </div>
      //     </h2>
      //   ),
      // } ,
      {
        Header: "Account",
        accessor: "account-number",
        Cell: simStyle
              },
      {
        Header: "Mobile",
        accessor: "service-number",
        Cell: simStyle1,
        
      },
      {
        Header: "Emp number",
        accessor: "emp-number",
        Cell: simStyle2,
        
      },
      {
        Header: "Emp Name",
        accessor: "employee-name",
        Cell: simStyle2,
        
      },
      {
        Header: "Dept coordinator",
        accessor: "coordinator",
        Cell: simStyle3,
        
      },

      // {
      //   Header: "Pre-cleansed Employee details",
      //   accessor: "emp",
      //   Cell: (props) => (
      //     <h2 className="p-3 text-[12px] font-bold border-r-8 shadow-md shadow-zinc-800 min-h-[150px] min-w-[300px] flex flex-col justify-between">
      //       <div className="flex justify-between">
      //         {" "}
      //         <h2> Emp Name:</h2>
      //         <p className="text-teal-800">
      //           {props.row.original["employee-name"]}
      //         </p>
      //       </div>
      //       <div className="flex justify-between">
      //         {" "}
      //         <h2> Emp Coordinator:</h2>
      //         <p className="text-stone-800">
      //           {props.row.original.coordinator}
      //         </p>{" "}
      //       </div>
      //       <div className="flex justify-between">
      //         {" "}
      //         <h2> Department:</h2>
      //         <p className="text-cyan-900">{props.row.original.department}</p>
      //       </div>
      //       <div className="flex justify-between">
      //         {" "}
      //         <h2> Location: </h2>
      //         <p className="text-stone-800">
      //           {props.row.original.location}
      //         </p>{" "}
      //       </div>
      //       <div className="flex justify-between">
      //         {" "}
      //         <h2> Section: </h2>
      //         <p className="text-cyan-900">{props.row.original.section}</p>{" "}
      //       </div>
      //     </h2>
      //   ),
      // },

   

      {
        Header: "Pre-cleansed Dept details",
        accessor: d => (
          <div className="text-[13px] text-cyan-900 tracking-widest">
            <div>Dept: {d.department}</div>
            <div>Section: {d.section}</div>
            <div>Location:{d.location}</div>
            <div>Credit Limit:{d.creditlimit?.$numberDecimal}</div>
            <div>Plan: {d.plan}</div>
          </div>
        )
      },

      {
        Header: "Cleansed details",
        accessor: "cleansed",
        Cell: (props) =>  (
          
          <h2 className="w-2/3 flex flex-col justify-between text-[13px] tracking-wider">
            {props.row.original.cleansed?.employee ? <div className="flex justify-between">
              <h2> Employee as in SAP: </h2>
              <p className="text-cyan-900">
                {props.row.original.cleansed?.employee}
              </p>
            </div> : null }

            {props.row.original.cleansed?.coordinator ? <div className="flex justify-between">
              <h2> Coordinator: </h2>
              <p className="text-cyan-900">
                {props.row.original.cleansed?.coordinator}
              </p>
            </div> : null }

            {props.row.original.cleansed?.department ? <div className="flex justify-between">
              <h2> Department:</h2>
              <p className="text-teal-800 ">
                {props.row.original.cleansed?.department}
              </p>
            </div> : null }

            {props.row.original.cleansed?.location ? <div className="flex justify-between">
              <h2> Location:</h2>
              <p className="text-stone-800">
                {props.row.original.cleansed?.location}
              </p>
            </div> : null }

            {props.row.original.cleansed?.creditlimit ? <div className="flex justify-between">
              <h2> Credit Limit: </h2>
              <p className="text-cyan-900">
                {props.row.original.cleansed?.creditlimit} SAR
              </p>
            </div> : null }

            { !props.row.original.cleansed && props.row.original["close-flag"] !== "true"?  ( <div className="flex justify-center"><Image  src="/images/datanotclean.png" alt="datanotclean" width={100} height={100} className="w-full h-auto" /> </div>) : (props.row.original["close-flag"]== "true" ? <p> Deleted</p> : null) }
          </h2>
        ),
      },

      // {
      //   Header: "Plan",
      //   accessor: "plan",

      //   Cell: Numberstylesim,
      // },
      // {
      //   Header: "Credit limit",
      //   accessor: "credit-limit.$numberDecimal",

      //   Cell: Numberstylesim1,
      // },

      {
        Header: "Action",
        accesor: "action",
        Cell: (row) => {
          return (
            <div>
              {row.row.original["close-flag"] == "true" ? null : row.row.original["flag"] == "cleansed" ? (
                <button>
                  <button
                    className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-1 px-4 rounded"
                    onClick={(e) => handleEdit(row)}
                  >
                    {" "}
                    EDIT{" "}
                  </button>
                </button>
              ) : (
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
                  onClick={(e) => handleEdit(row)}
                >
                  {" "}
                  CLEANSE{" "}
                </button>
              )}
            </div>
          );
        },
      },

      {
        Header: "Cleansed",
        accessor: "action",
        // Cell: Normalstylesim,
        Cell: (row) => (
          <>
          {row.row.original["flag"] == "cleansed" ? (
            <CheckCircleIcon className="mx-auto h-6 w-6 text-green-700" />
          ) : null}
        </>
      ),
      },

      {
        Header: "Deleted",
        accesor: "action",
        Cell: (row) => (
          <>
            {row.row.original["close-flag"] == "true" ? (
              <TrashIcon className="h-6 w-6 text-red-700" />
            ) : null}
          </>
        ),
      },
    ],

    // ],
    []
  );

  const [simlist, setSimlist] = useState([]);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/sim`);
      const json = await result.json();

      setSimlist(json);
    })();
  }, []);

  console.log(simlist);

  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen bg-gray-50 text-gray-900 w-[99%] ml-1">
        <div className="mt-6">
          <div className="font-bold relative text-md mb-3 py-3 px-9 bg-slate-300 shadow-md shadow-slate-800 flex justify-between">
            <p> List of STC SIM Mobiles and routers </p>
            <button className="absolute top-3 right-5 text-[12px] font-semibold text-amber-100 bg-green-600 px-2 py-1 border-2 hover:text-white hover:bg-green-800">
              {" "}
              <Link href="/simlist/newsim" className="text-amber-100 hover:text-white">
                + New SIM
              </Link>
            </button>
          </div>
          <div className="w-full">
            <Tablecomponent columns={columns} data={simlist} />
          </div>
          {showModal ? (
            <Simedit account={selectedAccount} setShowModal={setShowModal} />
          ) : null}
        </div>
      </div>
      <FooterComponent />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  // console.log(session.user)

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  // else if(session.user.role !== "admin"){
  //   return {
  //     redirect: {
  //       destination: "/auth/login",
  //       permanent: false,
  //     },
  //   };
  // }

  return {
    props: { session },
  };
}

export default Simlist;

import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
// import moment from 'moment'
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";

import {getSession} from "next-auth/react"

import Tablecomponent, {
 Numberstylesim,
  Boldstylesim,  
  Numberstylesim1,
  Boldstylesim1,
  Normalstylesim,
  Specialstylesim,
  Spstylesim,
} from "../../components/Tablecomponentsim";

import Simedit from "../../components/Simeditcomponent";

function Simlist() {
  const router = useRouter();  

  const [editmode, setEditmode] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState({});

    function handleEdit(row) {
    // console.log("clicked!! I am inside edit mode ")
    const account = row.row.values;
    setEditmode(true)
    // console.log(row.row.values["close-flag"]);
    setSelectedAccount({ ...account});
    setShowModal(true);
    return null;
  } 

  const columns = useMemo(
    () => [
      {
        Header: "Type",
        accessor: "type",
        Cell: Specialstylesim,
      },
      {
        Header: "Account No",
        accessor: "account-number",
        Cell: Boldstylesim1,
      },
      {
        Header: "Mobile No",
        accessor: "service-number",
        Cell: Boldstylesim1,
      },
      {
        Header: "Employee number",
        accessor: "emp-number",
        Cell: Boldstylesim
      },

      {
        Header: "Employee Name",
        accessor: "employee-name",
        Cell: Boldstylesim1
      },
      
      {
        Header: "Department",
        accessor: "dep",
        Cell: (props) => (
          <h2 className="bg-zinc-100 text-[11px] font-bold border-r-8" >
            <p className="text-teal-800">{props.row.original.department}</p>
            <p className="text-stone-800">{props.row.original.location}</p>
            <p className="text-cyan-900">{props.row.original.section}</p>
          </h2>
        ),
      },
           
      {
        Header: "Coordinator of user",
        accessor: "coordinator",
        Cell: Spstylesim,
      },

      {
        Header: "Plan",
        accessor: "plan",

        Cell: Numberstylesim,
      },
      {
        Header: "Credit limit",
        accessor: "credit-limit.$numberDecimal",

        Cell: Numberstylesim1,
      },
   
      {
        Header: "Cleanse",
        accesor: "action",
        Cell: (row) => {
          return  (
          <div >
            {row.row.values["flag"] == "cleansed" ? (<button> 
              <button className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-1 px-4 rounded" onClick={(e) => handleEdit(row)}> EDIT </button>
               </button>) : (
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded" onClick={(e) => handleEdit(row)}> CLEANSE </button>
            )}
          </div>
          )
        },
      },

      {
        Header: "Cleansed?",
        accessor: "flag",
        // Cell: Normalstylesim,
        Cell: (props) => (
          <>
          {props.row.original.flag == "cleansed" ? (
            <p className="font-bold text-white rounded-xl text-[11px] uppercase pl-3 py-[3px] bg-sky-800">{props.row.original.flag }</p>
          ) : null }
            
           
          </>
        ),
      },

      {
        Header:"Deleted?",
        accesor:"action",
        Cell: (row) => (
          <>
            {row.row.original["close-flag"] == 'true' ? (<p className="font-bold text-white rounded-xl text-[11px] uppercase pl-3 ml-3 py-[3px] bg-red-600"> DELETED </p>) : null }
           
          </>
        )
      }
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

  // console.log(simlist);

  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen bg-gray-50 text-gray-900 w-[99%] ml-1">
        <div className="mt-6">
          <div className="font-bold relative text-md mb-3 py-3 px-9 bg-slate-300 shadow-md shadow-slate-800 flex justify-between">
               <p> List of STC SIM Mobiles and routers </p>
                <button className="absolute top-3 right-5 text-[12px] font-semibold text-amber-100 bg-green-600 px-2 py-1 border-2 hover:text-white hover:bg-green-800"> + New SIM </button>
          </div> 
          
          <Tablecomponent columns={columns} data={simlist} />
          {showModal ? (
            <Simedit account={selectedAccount}  setShowModal={setShowModal}  />
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

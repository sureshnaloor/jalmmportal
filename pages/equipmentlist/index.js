import React, { useState, useEffect, useMemo } from "react";
// import Image from 'next/image'
import Rodal from "rodal";
import "rodal/lib/rodal.css";

import HeaderComponent from "../../components/HeaderComponent";
import Tablecomponent from "../../components/tablecomponent";
import FooterComponent from "../../components/FooterComponent";
import Geninfoform from "../../components/Geninfoequip";
import Geninfoform1 from "../../components/Geninfoequip1";

import Calibform from "../../components/Calibform";
import Calibform1 from "../../components/Calibform1";

import Userform from "../../components/Userform";
import Userform1 from "../../components/Userform1";

import moment from "moment";

import { getSession } from "next-auth/react";

function equipmentlist() {
  const [visibleinfo, setVisibleinfo] = useState(false);
  const [visibleinfo1, setVisibleinfo1] = useState(false)
  const [visibleuser, setVisibleuser] = useState(false);
  const [visibleuser1, setVisibleuser1] = useState(false);
  const [visiblecalib, setVisiblecalib] = useState(false);
  const [visiblecalib1, setVisiblecalib1] = useState(false);  

  const [selectedEquipment, setSelectedequipment] = useState(null);

  const showmodalinfo = (row) => {
    console.log("inside info modal");
    // console.log(row)
    setVisibleinfo(true);
    setSelectedequipment(row.original.assetnumber);
    // console.log(row.original.assetnumber)
  };

  const showmodalinfo1 = (row) => {
    console.log("inside info modal filled up with data");
    // console.log(row)
    setVisibleinfo1(true);
    setSelectedequipment(row.original.assetnumber);
    // console.log(row.original.assetnumber)
  };

  const showmodaluser = (row) => {
    console.log("inside USER modal");
    setVisibleuser(true);
    setSelectedequipment(row.original.assetnumber);
  };

  const showmodaluser1 = (row) => {
    console.log("inside USER modal filled up with data");
    setVisibleuser1(true);
    setSelectedequipment(row.original.assetnumber);
  };

  const showmodalcalib = (row) => {
    console.log("inside CALIB modal");
    setVisiblecalib(true);
    setSelectedequipment(row.original.assetnumber);
  };

  const showmodalcalib1 = (row) => {
    console.log("inside CALIB modal filled with data");
    setVisiblecalib1(true);
    setSelectedequipment(row.original.assetnumber);
  };

  const columns = useMemo(
    () => [
      {
        Header: "Asset Number",
        accessor: "assetnumber",
        Cell: (props) => (
          <div className="flex justify-between">
            <p className="text-teal-800 text-[12px] font-Lato font-bold uppercase">
              {props.row.original.assetnumber}
            </p>
          </div>
        ),

        // Filter: SelectColumnFilter,
      },
      {
        Header: "Equipment Name",
        accessor: "assetdescription",
        Cell: (props) => (
          <div className="flex justify-between">
            <p className="text-purple-900 text-[12px] font-bold">
              {props.row.original.assetdescription}
            </p>
          </div>
        ),
      },

      {
        Header: "Purchase date",
        accessor: "acquiredDate",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-teal-800 text-[12px] font-bold tracking-wider">
              {moment(props.row.original.acquiredDate).format("DD-MM-yy")}
            </p>
          </div>
        ),
      },

      {
        Header: "Purchase value",
        accessor: "acquiredValue",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-teal-800 text-[12px] font-bold tracking-widest">
              {(
                Math.round(props.row.original.acquiredValue * 100) / 100
              ).toLocaleString("en-US", { style: "currency", currency: "SAR" })}
            </p>
          </div>
        ),
      },

      {
        Header: "Equipment Status",
        accessor: "action",
        Cell: (props) => (
          <>
            <div className="flex justify-between align-middle  py-1  my-1">
              <button className="p-3 rounded-full bg-sky-100 hover:bg-sky-200">
                {props.row.original.infoFlag == "yes" ? (
                   <img
                   src="/images/completed.png"
                   alt="info"
                   width={15}
                   height={15}
                   onClick={(e) => showmodalinfo1(props.row)}
                   
                 />
                ) : (
                  <img
                    src="/images/info.png"
                    alt="info"
                    width={15}
                    height={15}
                    onClick={(e) => showmodalinfo(props.row)}
                  />
                )}
              </button>
              <button className="p-3 rounded-full bg-green-100 hover:bg-green-200">
                {props.row.original.custodyFlag == "yes" ? (
                   <img
                   src="/images/completed.png"
                   alt="info"
                   width={15}
                   height={15}
                   onClick={(e) => showmodaluser1(props.row)}
                   
                 />
                ) : (
                   <img
                   src="/images/man.png"
                   alt="users"
                   width={15}
                   height={15}
                   onClick={(e) => showmodaluser(props.row)}
                 />
                )}
               
              </button>
              <button className="p-3 rounded-full bg-teal-100 hover:bg-teal-200">
                {props.row.original.calibFlag == "yes" ? (
                   <img
                   src="/images/completed.png"
                   alt="info"
                   width={15}
                   height={15}
                   onClick={(e) => showmodalcalib1(props.row)}
                   
                 />
                ) : (
                   <img
                   src="/images/measurement.png"
                   alt="calib"
                   width={15}
                   height={15}
                   onClick={(e) => showmodalcalib(props.row)}
                 /> 
                )}
                
              </button>
              <button className="p-3 rounded-full bg-orange-100 hover:bg-orange-200">
                <img
                  src="/images/search.png"
                  alt="details"
                  width={15}
                  height={15}
                  onClick={(e) => null}
                />
              </button>
            </div>
          </>
        ),
      },
    ],

    // ],
    []
  );

  const [equipmentlist, setEquipmentlist] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/equipmentlist`);
      const json = await result.json();

      setEquipmentlist(json);
    })();
  }, []);

  // console.log(equipmentlist);
  return (
    <main>
      <HeaderComponent />
      <div className="min-h-screen  w-11/12 bg-stone-100 p-3">
        <div className=" w-11/12 flex flex-col justify-center mx-auto">
          <Tablecomponent columns={columns} data={equipmentlist} />
          <Rodal
            animation="door"
            width={1000}
            height={580}
            className="bg-sky-200/90"
            visible={visibleinfo}
            onClose={() => setVisibleinfo(false)}
          >
            <div className="bg-teal-50/90 p-1">
              {" "}
              <Geninfoform equip={selectedEquipment} />{" "}
            </div>
          </Rodal>

          <Rodal
            animation="door"
            width={1000}
            height={580}
            className="bg-sky-200/90"
            visible={visibleinfo1}
            onClose={() => setVisibleinfo1(false)}
          >
            <div className="bg-teal-50/90 p-1">
              {" "}
              <Geninfoform1 equip={selectedEquipment} />{" "}
            </div>
          </Rodal>

          <Rodal
            animation="spin"
            width={1000}
            height={600}
            visible={visibleuser}
            onClose={() => setVisibleuser(false)}
          >
            <div className="bg-teal-50/90 p-1">
              {" "}
              <Userform equip={selectedEquipment} />{" "}
            </div>
          </Rodal>

          <Rodal
            animation="spin"
            width={1000}
            height={600}
            visible={visibleuser1}
            onClose={() => setVisibleuser1(false)}
          >
            <div className="bg-teal-50/90 p-1">
              {" "}
              <Userform1 equip={selectedEquipment} />{" "}
            </div>
          </Rodal>

          <Rodal
            animation="door"
            width={1000}
            height={600}
            className="bg-teal-200/50"
            visible={visiblecalib}
            onClose={() => setVisiblecalib(false)}
          >
            <div className="bg-teal-50/90 p-1">
              {" "}
              <Calibform equip={selectedEquipment} />{" "}
            </div>
          </Rodal>

          <Rodal
            animation="door"
            width={1000}
            height={600}
            className="bg-teal-200/50"
            visible={visiblecalib1}
            onClose={() => setVisiblecalib1(false)}
          >
            <div className="bg-teal-50/90 p-1">
              {" "}
              <Calibform1 equip={selectedEquipment} />{" "}
            </div>
          </Rodal>

        </div>
      </div>
      <div className="mt-12">
      <FooterComponent />
      </div>
    </main>
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

export default equipmentlist;

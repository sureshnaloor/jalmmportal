import React, { useState, useEffect, useMemo } from "react";
import Image from 'next/image'
import Rodal from "rodal";
import 'rodal/lib/rodal.css';

import HeaderComponent from "../../components/HeaderComponent";
import Tablecomponent from "../../components/tablecomponent";
import FooterComponent from "../../components/FooterComponent";
import Geninfoform from "../../components/Geninfoequip";
import Calibform from "../../components/Calibform";
import Userform from "../../components/Userform";
import moment from "moment";

import { getSession } from "next-auth/react";

function equipmentlist() {
  const [visibleinfo, setVisibleinfo] = useState(false)
  const [visibleuser, setVisibleuser] = useState(false)
  const [visiblecalib, setVisiblecalib] = useState(false)

  const [selectedEquipment, setSelectedequipment] = useState(null)
 

  const showmodalinfo = (row) => {
    console.log("inside info modal")
    setVisibleinfo(true) 
    setSelectedequipment(row.row.values["assetnumber"]) 
    console.log(row.row.values["assetnumber"])  
  }

  const showmodaluser = (row) => {
    console.log("inside USER modal")
     
    setVisibleuser(true)
    setSelectedequipment(row.row.values["assetnumber"])    
  }

  const showmodalcalib = (row) => {
    console.log("inside CALIB modal")
    
    setVisiblecalib(true)
    setSelectedequipment(row.row.values["assetnumber"])     
  }

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
              
              {(Math.round(props.row.original.acquiredValue*100)/100).toLocaleString("en-US", {style:"currency", currency:"SAR"})}
            </p>
          </div>
        ),
      },

      {
        Header: "Equipment Status",
        accessor: "action",
        Cell: (row) => (
          <>
            <div className="flex justify-between align-middle  py-1  my-1">
              <button className="p-3 rounded-full bg-sky-100 hover:bg-sky-200" > <Image src="/images/info.png" alt="info" width={15} height={15} onClick={(e) => showmodalinfo(row)} ></Image> </button>
              <button className="p-3 rounded-full bg-green-100 hover:bg-green-200"> <Image src="/images/man.png" alt="users" width={15} height={15} onClick={(e) => showmodaluser(row)}></Image> </button>
              <button className="p-3 rounded-full bg-teal-100 hover:bg-teal-200"> <Image src="/images/measurement.png" alt="calib" width={15} height={15} onClick={(e) => showmodalcalib(row)}></Image> </button>
              <button className="p-3 rounded-full bg-orange-100 hover:bg-orange-200"> <Image src="/images/search.png" alt="details" width={15} height={15} onClick={(e) => null}></Image> </button>
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
      <div className="w-11/12 bg-stone-100 p-3">
        <div className="w-11/12 flex flex-col justify-center mx-auto">
          <Tablecomponent columns={columns} data={equipmentlist} />
          <Rodal animation ="door" width={1000} height={580} className="bg-sky-200/90" visible = {visibleinfo} onClose={() => setVisibleinfo(false)}>
            <div className="bg-teal-50/90 p-1"> <Geninfoform equip = {selectedEquipment} /> </div>
          </Rodal>
          <Rodal animation="spin" width={1000} height={600} visible = {visibleuser} onClose={() => setVisibleuser(false)}>
          <div className="bg-teal-50/90 p-1"> <Userform equip = {selectedEquipment} /> </div>
          </Rodal>
          <Rodal animation ="door" width={1000} height={600} className="bg-teal-200/50" visible = {visiblecalib} onClose={() => setVisiblecalib(false)}>
          <div className="bg-teal-50/90 p-1"> <Calibform equip = {selectedEquipment} /> </div>
          </Rodal>
        </div>
      </div>
      <FooterComponent />
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

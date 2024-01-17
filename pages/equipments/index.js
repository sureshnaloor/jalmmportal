import React, { useState, useEffect, useMemo }from "react";
import { useForm } from "react-hook-form";
import HeaderComponent from "../../components/HeaderComponent";
import Tablecomponent from "../../components/Tablecomponentsim";
import FooterComponent from "../../components/FooterComponent";

import { getSession } from "next-auth/react";

function equipments() {

  const columns = useMemo(
    () => [
      {
        Header: "Asset Number",
        accessor: "Assetnumber",
        Cell: (props) => (
          <div className="flex justify-between">
            <p className="text-teal-800 text-[12px] font-Lato font-bold uppercase">
              {props.row.original.Assetnumber}
            </p>
          </div>
        ),

        // Filter: SelectColumnFilter,
      },
      {
        Header: "Equipmentname as in SAP",
        accessor: "EquipmentnameSAP",
        Cell: (props) => (
          <div className="flex justify-between">
            <p className="text-purple-900 text-[12px] font-semibold">
              {props.row.original.EquipmentnameSAP}
            </p>
          </div>
        ),
      },     

      {
        Header: "Asset details",
        accessor: "details",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Legacy Number: </span>{props.row.original.Legacyassetnumber}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Serial Number: </span>{props.row.original.Equipmentserialnumber}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Equipment name in SAP: </span>{props.row.original.EquipmentnameSAP}
            </p>
          </div>
        ),
      },

      {
        Header: "Calibration details",
        accessor: "calibration",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Lastcalibrateddate: </span>{props.row.original["equipment_calibration"].Lastcalibrateddate}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Calib due: </span>{props.row.original["equipment_calibration"].calibrationdue}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Calib. certificate: </span>{props.row.original["equipment_calibration"].Calibrationcertificateinfo}
            </p>
          </div>
        ),
      },

      {
        Header: "Custodian details",
        accessor: "custodian",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Custodian Number: </span>{props.row.original["equipment_users"].CustodianEmpno}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Location: </span>{props.row.original["equipment_users"].Location}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Since: </span>{props.row.original["equipment_users"].Custodyfromdate}
            </p>
          </div>
        ),
      },

    ],

    // ],
    []
  );


  const [equipmentlist, setEquipmentlist] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/equipment`);
      const json = await result.json();

      setEquipmentlist(json);
    })();
  }, []);

  console.log(equipmentlist);
  return (
    <main>
      <HeaderComponent />
      <div className="w-11/12 bg-stone-100 p-3">
       

        <div className="w-11/12 flex flex-col justify-center mx-auto">
        <Tablecomponent columns={columns} data={equipmentlist} />
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

export default equipments;

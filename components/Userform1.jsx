import React, { useState, useEffect } from "react";
import moment from "moment";

function Userform1({ equip }) {
  const [equipcustodyinfo, setEquipcustodyinfo] = useState({});

  useEffect(() => {
    const fetchEquipcustodyinfo = async () => {
      const response = await fetch(`/api/calibequipmentcustody/${equip}`);
      const json = await response.json();
      setEquipcustodyinfo(json);
    };
    fetchEquipcustodyinfo();
  }, [equip]);

  console.log(equipcustodyinfo);

  return (
    <main className="w-full min-h-full">
      <div className="relative mx-auto max-w-3xl rounded-lg bg-gradient-to-tr from-pink-300 to-blue-300 p-0.5 shadow-lg">
        <div className=" p-7 rounded-md">
          <h1 className="font-bold flex justify-center text-xl mb-2 border-b-4 border-blue-900">
            User/custodian info for Equipment : {equip}
          </h1>
          <div className="flex justify-around  align-middle mb-9 ">
            <p className="font-bold text-stone-900 text-lg font-Lato p-1 mt-3 mb-2 border-2 bg-slate-300 ">
              {" "}
              Custodian Name: {equipcustodyinfo?.custodianname}{" "}
            </p>

            <p className="font-semibold text-green-100 text-lg font-Lato p-1 mt-3 mb-2 border-2 bg-slate-500 ">
              {" "}
              Custodian Emp Number: {equipcustodyinfo?.custodianempnumber}{" "}
            </p>
          </div>

          <div className="flex flex-col border-t-2 border-teal-500 mb-5 pb-3">
           <div className="flex justify-between ">
            <p className="text-green-900 font-bold text-xl ">
              {" "}
              Department:{" "}
              </p>
              <p className="text-stone-800 font-thin">
                {equipcustodyinfo?.department}{" "}
              </p>
              </div>
            
              <div className="flex justify-between">
            <p className="text-stone-900 font-semibold text-lg ">
              {" "}
              Project: 
            </p>
            <p>
            {equipcustodyinfo?.project}{" "}
            </p>
            </div>
           
          </div>

          <div>
            If warehouse, rack location: {equipcustodyinfo?.racklocation}
          </div>

          <div className="flex justify-between border-t-2  mb-5 mt-3 align-middle border-b-4 pb-3 border-green-900">
            <h3 className="font-bold text-lg">
              {" "}
              Custody from:{" "}
              
            </h3>
            <h3 className="font-bold text-lg text-red-800">
            {moment(equipcustodyinfo?.custodyfrom).format("DD/MM/YYYY")} 
            </h3>
            </div>
            <h5 className="font-semibold text-lg text-amber-900">
              {" "}
              Remarks: {equipcustodyinfo?.remarks}
            </h5>
          
        </div>
      </div>
    </main>
  );
}

export default Userform1;

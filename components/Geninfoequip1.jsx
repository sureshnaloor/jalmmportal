import React, { useState, useEffect } from "react";


function Geninfoform1({ equip }) {
  const [equipgeninfo, setEquipgeninfo] = useState({});

  useEffect(() => {
    const fetchEquipgeninfo = async () => {
      const response = await fetch(`/api/calibequipment/${equip}`);
      const json = await response.json();
      setEquipgeninfo(json);
    };
    fetchEquipgeninfo();
  }, [equip]);

  console.log(equipgeninfo);

  return (
    <main className="w-full min-h-full">
      <div className="relative mx-auto w-full min-h-full rounded-lg bg-gradient-to-tr from-blue-200 to-teal-300 p-0.5 shadow-lg">
        <div className=" p-7 rounded-md">
          <h1 className="font-bold flex justify-center text-xl mb-2 border-b-4 border-blue-900">
            General info for Equipment : {equip}
          </h1>
          <div className="flex justify-center align-middle ">
          <p className="font-bold text-stone-900 text-lg font-Lato p-1 mt-3 mb-2 border-2 bg-slate-300 "> Technical Name: {equipgeninfo?.geninfo?.technicalname} </p>
          </div>

          <div className="flex flex-col mb-5 pb-3">
            
          <p className="text-green-900 font-bold text-xl "> Manufacturer: <span className="text-stone-800 font-thin">{equipgeninfo?.geninfo?.manufacturer} </span></p>
          <p className="text-stone-900 font-semibold text-lg "> Model: {equipgeninfo?.geninfo?.model} </p>
          <p className="text-sky-900 font-semibold text-lg"> Website : {equipgeninfo?.geninfo?.website} </p>
          </div>

          <div className="flex justify-around mb-5 mt-3 align-middle border-b-4 pb-3 border-green-900">
          <h3 className="font-bold text-lg"> Serial Number: {equipgeninfo?.geninfo?.serialnumber}</h3>
          <h5 className="font-semibold text-lg text-amber-900"> Legacy Number: {equipgeninfo?.geninfo?.legacynumber}</h5>
          </div>

          <div className="text-xl text-green-900 ">
          <h3 className="font-semibold pb-3"> Accessories:<span className="font-thin"> {equipgeninfo?.geninfo?.accessories}</span></h3>
          <h1 className="font-bold text-teal-800"> Equipment used for :<span className="font-thin"> {equipgeninfo?.geninfo?.accessories} </span></h1>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Geninfoform1;

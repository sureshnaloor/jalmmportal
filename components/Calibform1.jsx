import React, { useState, useEffect } from "react";
import moment from "moment";

function Calibform1({ equip }) {
  const [equipcalibinfo, setEquipcalibinfo] = useState({});

  useEffect(() => {
    const fetchEquipcalibinfo = async () => {
      const response = await fetch(`/api/calibequipmentcertificate/${equip}`);
      const json = await response.json();
      setEquipcalibinfo(json);
    };
    fetchEquipcalibinfo();
  }, [equip]);

  console.log(equipcalibinfo);

  return (
    <main className="w-full min-h-full bg-gradient-to-br from-stone-100 to-stone-500 shadow-lg ">
      <div className="relative mx-auto w-full min-h-full rounded-lg bg-gradient-to-tr from-amber-300 to-purple-300 p-0.5 shadow-lg">
        <div className=" p-7 rounded-md">
          <h1 className="font-bold flex justify-center text-xl mb-2 border-b-4 border-blue-900">
            Calibration info for Equipment : {equip}
          </h1>
          <div className="flex justify-between  align-middle mb-3 ">
            <p className="font-bold text-stone-900 px-6 text-lg font-Lato p-1 mt-3 mb-1 border-2 bg-slate-300 ">
              {" "}
              Calibration Certificate Number:
            </p>

            <p className="font-semibold text-green-100 px-6 tracking-widest text-lg font-Lato p-1 mt-3 mb-1 border-2 bg-slate-500 ">
              {equipcalibinfo?.calibcertificate}
            </p>
          </div>

          <div className="flex flex-col border-t-2 border-teal-500 mb-3 pb-2">
            <div className="flex justify-between ">
              <p className="text-green-900 font-bold text-xl ">
                Calibration certificate date:
              </p>
              <p className="text-stone-800 font-semibold text-lg ">
                {moment(equipcalibinfo?.calibrationdate).format("DD/MM/YYYY")}
              </p>
            </div>

            <div className="flex justify-between">
              <p className="text-stone-900 font-semibold text-lg ">
                Calibrated by: 
                 </p>
              <p>
                {equipcalibinfo?.calibratedby}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-stone-900 font-semibold text-lg ">
                Calibration PO Number: 
                 </p>
              <p>
                {equipcalibinfo.calibrationpo}
              </p>
            </div>
          </div>

          <div className="flex text-lg text-bold justify-between border-t-2  mb-5 mt-3 align-middle border-b-4 pb-3 border-green-900">
            <h3> Calibration file record# : </h3>
            <h3> {equipcalibinfo.calibfile} </h3>
          </div>

          <div className="flex justify-between  mb-3 mt-3 align-middle border-b-4 pb-3 border-green-900">
            <h3 className="font-bold text-lg"> Calibration Valid from: </h3>
            <h3 className="font-bold text-lg text-red-800"> {moment(equipcalibinfo.calibrationfromdate).format("DD/MM/YYYY")}</h3>
          </div>

          <div className="flex justify-between   mb-3 mt-3 align-middle border-b-4 pb-3 border-green-900">
            <h3 className="font-bold text-lg"> Calibration Valid to: </h3>
            <h3 className="font-bold text-lg text-red-800"> {moment(equipcalibinfo.calibrationtodate).format("DD/MM/YYYY")}</h3>
          </div>
          <div className="flex justify-between   mb-3 mt-3 align-middle border-b-4 pb-3 border-green-900">
            <p> Remarks: </p>
          <p className="text-lg text-semibold text-green-800"> {equipcalibinfo?.remarks}</p>

          </div>

          <div className="flex justify-center p-3 bg-red-800 text-white ">
          <h5 className="font-bold text-lg ">{(moment(equipcalibinfo.calibrationtodate).diff(moment(Date.now()), "days")) < 0 && <p>{moment(equipcalibinfo.calibrationtodate).diff(moment(Date.now()), "days")} days ago calibration expired !! the equipment is not to be used without calibrating.</p>} </h5>
          <h5 className="font-bold text-lg bg-green-900 text-white ">{(moment(equipcalibinfo.calibrationtodate).diff(moment(Date.now()), "days")) > 0 && <p>{moment(equipcalibinfo.calibrationtodate).diff(moment(Date.now()), "days")} days remaining for  calibration validity..</p>} </h5>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Calibform1;

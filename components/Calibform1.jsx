import React, { useState, useEffect } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";

import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";

function Calibform1({ equip }) {
  const [equipcalibinfo, setEquipcalibinfo] = useState([]);

  const router = useRouter();

  const [calibrationdate, setCalibrationdate] = useState(new Date());
  const [calibrationfromdate, setCalibrationfromdate] = useState(new Date());
  const [calibrationtodate, setCalibrationtodate] = useState(new Date());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchEquipcalibinfo = async () => {
      const response = await fetch(`/api/calibequipmentcertificate/${equip}`);
      const json = await response.json();
      setEquipcalibinfo(json);
    };
    fetchEquipcalibinfo();
  }, [equip]);

  console.log(equipcalibinfo);

  const onSubmit = async (data) => {
    data = {
      ...data,
      equip,
      user: "suresh",
      calibrationdate,
      calibrationfromdate,
      calibrationtodate,
    };
    console.log(data);
    await fetch("/api/calibequipmentcertificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    await fetch(`/api/fixedassets/calibInfo/${equip}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.success("submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    reset();
    router.reload();
  };

  const onErrors = (errors) => console.error(errors);

  return (
    <main className="w-full min-h-full  shadow-lg">
      <div className="relative mx-auto w-full min-h-full rounded-lg">
        <div className=" p-7 rounded-md grid grid-cols-3 gap-3 min-h-full">
          <div className="min-h-full">
            <div className="bg-blue-200  px-2 col-span-1">
              <h1 className="font-bold flex justify-center text-[13px] mb-1 border-b-2 border-blue-900">
                Calibration info for Equipment : {equip}
              </h1>
              <div className="flex justify-between ">
                <p className="font-semibold text-stone-900 text-[12px] font-Lato  mt-1 mb-1">
                  {" "}
                  Certificate Number:
                </p>

                <p className="font-semibold  text-[11px] font-Lato  mt-1 mb-1">
                  {equipcalibinfo[0]?.calibcertificate}
                </p>
              </div>

              <div className="flex flex-col  mb-3 pb-2">
                <div className="flex justify-between ">
                  <p className="text-green-900 font-bold text-[12px] ">
                    Certificate date:
                  </p>
                  <p className="text-stone-800 font-semibold text-[12px] ">
                    {moment(equipcalibinfo[0]?.calibrationdate).format(
                      "DD/MM/YYYY"
                    )}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-stone-900 font-semibold text-[12px] ">
                    Calibrated by:
                  </p>
                  <p className="text-[12px] tracking-wider">
                    {equipcalibinfo[0]?.calibratedby}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-stone-900 font-semibold text-[12px] ">
                    Calibration PO Number:
                  </p>
                  <p className="text-stone-900 font-semibold text-[11px] ">{equipcalibinfo[0]?.calibrationpo}</p>
                </div>
              </div>

              <div className="flex text-[12px] font-semibold justify-between align-middle">
                <h3> Calibration file record# : </h3>
                <h3 className="text-[12px] font-semibold text-stone-800"> {equipcalibinfo[0]?.calibfile} </h3>
              </div >

              <div className="flex justify-between  align-middle ">
                <h3 className="font-bold text-[13px]">
                  {" "}
                  Calibration Valid from:{" "}
                </h3>
                <h3 className="font-bold text-[13px] text-red-800">
                  {" "}
                  {moment(equipcalibinfo[0]?.calibrationfromdate).format(
                    "DD/MM/YYYY"
                  )}
                </h3>
              </div>

              <div className="flex justify-between    align-middle ">
                <h3 className="font-bold text-[13px]">
                  {" "}
                  Calibration Valid to:{" "}
                </h3>
                <h3 className="font-bold text-[13px] text-red-800">
                  {" "}
                  {moment(equipcalibinfo[0]?.calibrationtodate).format(
                    "DD/MM/YYYY"
                  )}
                </h3>
              </div>
              <div className="flex justify-between font-semibold text-[12px]  align-middle">
                <p> Remarks: </p>
                <p className="text-[12px] text-semibold text-green-800">
                  {" "}
                  {equipcalibinfo[0]?.remarks}
                </p>
              </div>

              <div className="flex justify-center py-1 px-1  ">
                <h5 className="font-bold text-[12px] bg-red-800 text-white">
                  {moment(equipcalibinfo[0]?.calibrationtodate).diff(
                    moment(Date.now()),
                    "days"
                  ) < 0 && (
                    <p>
                      {moment(equipcalibinfo[0].calibrationtodate).diff(
                        moment(Date.now()),
                        "days"
                      )}{" "}
                      days ago calibration expired !! the equipment is not to be
                      used without calibrating.
                    </p>
                  )}{" "}
                </h5>
                <h5 className="font-bold text-[12px] py-1 px-1  bg-green-600 text-white ">
                  {moment(equipcalibinfo[0]?.calibrationtodate).diff(
                    moment(Date.now()),
                    "days"
                  ) > 0 && (
                    <p>
                      {moment(equipcalibinfo[0]?.calibrationtodate).diff(
                        moment(Date.now()),
                        "days"
                      )}{" "}
                      days remaining for calibration validity.
                    </p>
                  )}{" "}
                </h5>
              </div>
            </div>
            <div className="bg-red-100 pb-1 px-2 pt-6 ">
              <h3 className="text-[14px] font-bold border-b-2 pb-3 border-stone-900 text-stone-900">
                Previous calibrations History:{" "}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-[12px] font-semibold border-b-2 border-blue-900 text-zinc-900">
                <h5> Calibration date </h5>
                <h5> From: </h5>
                <h5> To: </h5>
              </div>
              {equipcalibinfo.map((calib, index) => (
                <div className="grid grid-cols-3 gap-3 font-semibold text-zinc-900 text-[12px]">
                  <h6>
                    {" "}
                    {moment(calib.calibrationdate).format("DD-MM-YYYY")}{" "}
                  </h6>
                  <h6>
                    {" "}
                    {moment(calib.calibrationfromdate).format("DD-MM-YYYY")}
                  </h6>
                  <h6>
                    {" "}
                    {moment(calib.calibrationtodate).format("DD-MM-YYYY")}
                  </h6>
                </div>
              ))}
            </div>
          </div>
          <div className=" min-h-full col-span-2">
            {/* // form content   */}

            <main className="w-full min-h-full p-1">
              <div className="flex justify-center bg-green-50/90 align-middle">
                <form onSubmit={handleSubmit(onSubmit, onErrors)}>
                  <div className="w-full  pr-2">
                    {/* the form */}

                    <div className="flex flex-col ">
                      <div className="flex flex-col sm:flex-row items-center">
                        <h2 className="font-black text-[14px] mr-auto text-sky-900 tracking-wider">
                          Equipment Calibration Information:
                        </h2>
                        <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
                      </div>

                      <div className="mt-5">
                        <div className="form">
                          <div className="md:flex flex-row md:space-x-4 w-full text-xs">
                            {/* equipment complete name */}
                            <div className="mb-3 space-y-2 w-full text-xs">
                              <label className="font-bold text-gray-600 py-2">
                                Calibration certificate Date:{" "}
                                <abbr title="required">*</abbr>
                              </label>
                              <DatePicker
                                className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                selected={calibrationdate}
                                onChange={(date) => {
                                  setCalibrationdate(date);
                                }}
                                popperModifiers={[
                                  {
                                    name: "offset",
                                    options: {
                                      offset: [5, 10],
                                    },
                                  },
                                  {
                                    name: "preventOverflow",
                                    options: {
                                      rootBoundary: "viewport",
                                      tether: false,
                                      altAxis: true,
                                    },
                                  },
                                ]}
                              />
                            </div>

                            <div className="mb-3 space-y-2 w-full text-xs">
                              <label className="font-bold text-gray-600 py-2">
                                Calibration certificate:{" "}
                                <abbr title="required">*</abbr>
                              </label>
                              <input
                                placeholder="Calibration certificate number..."
                                className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                required="required"
                                type="text"
                                name="calibcertificate"
                                id="calibcertificate"
                                {...register("calibcertificate", {
                                  required:
                                    "calibration certificate has to be entered",
                                })}
                              />
                            </div>

                            <div className="space-y-2 w-full text-xs">
                              <label className="font-bold text-gray-600 py-2">
                                Calibrated by (TP agency){" "}
                                <abbr title="required">*</abbr>
                              </label>
                              <input
                                placeholder="calibrated by:"
                                className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                required="required"
                                type="text"
                                name="calibratedby"
                                id="calibratedby"
                                {...register("calibratedby", {
                                  required:
                                    "TPI who did calibration is required to be entered",
                                })}
                              />
                            </div>
                          </div>

                          <div className="md:flex md:flex-row md:space-x-4 w-full text-xs">
                            <div className="w-full flex flex-col mb-3">
                              <label className="font-bold text-gray-600 py-2">
                                Calibration File#:
                              </label>
                              <input
                                placeholder="File Number#..."
                                className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                                type="text"
                                name="calibfile"
                                id="calibfile"
                                {...register("calibfile")}
                              />
                            </div>
                            <div className="w-full flex flex-col mb-3">
                              <label className="font-bold text-gray-600 py-2">
                                Calibration PO <abbr title="required">*</abbr>
                              </label>
                              <input
                                className="block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4 md:w-full "
                                required="required"
                                placeholder="SAP PO number#...."
                                type="text"
                                name="calibrationpo"
                                id="calibrationpo"
                                {...register("calibrationpo")}
                              ></input>
                            </div>
                          </div>

                          <div className="md:flex md:flex-row md:space-x-4 w-full text-xs">
                            <div className="w-full flex flex-col mb-3">
                              <label className="font-bold text-gray-600 py-2">
                                Calibration valid from:
                              </label>
                              <DatePicker
                                className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                selected={calibrationfromdate}
                                onChange={(date) => {
                                  setCalibrationfromdate(date);
                                }}
                                popperModifiers={[
                                  {
                                    name: "offset",
                                    options: {
                                      offset: [5, 10],
                                    },
                                  },
                                  {
                                    name: "preventOverflow",
                                    options: {
                                      rootBoundary: "viewport",
                                      tether: false,
                                      altAxis: true,
                                    },
                                  },
                                ]}
                              />
                            </div>
                            <div className="w-full flex flex-col mb-3">
                              <label className="font-bold text-gray-600 py-2">
                                Calibration valid Till:{" "}
                                <abbr title="required">*</abbr>
                              </label>
                              <DatePicker
                                className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                selected={calibrationtodate}
                                onChange={(date) => {
                                  setCalibrationtodate(date);
                                }}
                                popperModifiers={[
                                  {
                                    name: "offset",
                                    options: {
                                      offset: [5, 10],
                                    },
                                  },
                                  {
                                    name: "preventOverflow",
                                    options: {
                                      rootBoundary: "viewport",
                                      tether: false,
                                      altAxis: true,
                                    },
                                  },
                                ]}
                              />
                            </div>
                          </div>

                          <div className="flex-auto w-full mb-1 text-xs space-y-2">
                            <label className="font-bold text-gray-600 py-2">
                              Remarks if any:
                            </label>
                            <textarea
                              required=""
                              name="remarks"
                              id="remarks"
                              className=" min-h-[60px] max-h-[100px] h-16  appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4"
                              placeholder="Enter remarks/comments if any...."
                              spellCheck="false"
                              {...register("remarks")}
                            ></textarea>
                          </div>
                          <p className="text-xs text-red-500 text-right my-3">
                            Required fields are marked with an asterisk{" "}
                            <abbr title="Required field">*</abbr>
                          </p>
                          <div className="mt-5 text-right md:space-x-3 md:block flex flex-col-reverse">
                            <button className="mb-2 md:mb-0 bg-white px-5 py-2 text-[12px] shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100">
                              {" "}
                              Cancel{" "}
                            </button>
                            <button class="mb-2 md:mb-0 bg-green-400 px-5 py-2 text-[12px] shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-green-500">
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
                {/* <div className="w-1/2 h-full flex flex-col justify-center align-bottom pl-2">
                  <div className="bg-purple-900 mt-24 py-2">
                    <h1 className="text-white text-sm font-bold">
                      {" "}
                      Info on the calibration of equipment: {equip}
                    </h1>
                  </div>
                  <h3 className=" mt-20 font-thin leading-9 italic text-[12px] tracking-wider font-Roboto">
                    Calibration information of this equipment will be entered by
                    <span className="font-bold text-stone-900">
                      {" "}
                      warehouse equipment coordinator{" "}
                    </span>{" "}
                    only here.
                  </h3>
                </div> */}
              </div>
            </main>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Calibform1;

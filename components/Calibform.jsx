import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";

import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";

function Calibform({ equip }) {
  const router = useRouter();

  
  const [calibrationdate, setCalibrationdate] = useState(new Date());
  const [calibrationfromdate, setCalibrationfromdate] = useState(new Date());
  const [calibrationtodate, setCalibrationtodate] = useState(new Date())

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    data = { ...data, equip, user: "suresh", calibrationdate, calibrationfromdate, calibrationtodate };
    console.log(data);
    await fetch("/api/calibequipmentcertificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    await fetch(`/api/fixedassets/calibInfo/${equip}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
            
    })

    toast.success("submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    reset();
    router.reload();

    
  };

  const onErrors = (errors) => console.error(errors);

  return (
    <main className="w-full min-h-full p-1">
      <div className="flex justify-center bg-green-50/90 align-middle">
        <form onSubmit={handleSubmit(onSubmit, onErrors)}>
          <div className="w-full border-r-2 border-slate-900 pr-2">
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
                      <label className="font-semibold text-gray-600 py-2">
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
                      <label className="font-semibold text-gray-600 py-2">
                        Calibration certificate: <abbr title="required">*</abbr>
                      </label>
                      <input
                        placeholder="Calibration certificate number..."
                        className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                        required="required"
                        type="text"
                        name="calibcertificate"
                        id="calibcertificate"
                        {...register("calibcertificate", {
                          required: "calibration certificate has to be entered",
                        })}
                      />
                    </div>

                    <div className="mb-3 space-y-2 w-full text-xs">
                      <label className="font-semibold text-gray-600 py-2">
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
                      <label className="font-semibold text-gray-600 py-2">
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
                      <label className="font-semibold text-gray-600 py-2">
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
                      <label className="font-semibold text-gray-600 py-2">
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
                      <label className="font-semibold text-gray-600 py-2">
                        Calibration valid Till: <abbr title="required">*</abbr>
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
                    <label className="font-semibold text-gray-600 py-2">
                      Remarks if any:
                    </label>
                    <textarea
                      required=""
                      name="remarks"
                      id="remarks"
                      className=" min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4"
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
                    <button className="mb-2 md:mb-0 bg-green-400 px-5 py-2 text-[12px] shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-green-500">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="w-1/2 h-full flex flex-col justify-center align-bottom pl-2">
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
        </div>
      </div>
    </main>
  );
}

export default Calibform;

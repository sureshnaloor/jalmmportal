import React, { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";

import DatePicker from "react-datepicker";

import useDebounce from "../lib/useDebounce";

const departments = [
  "ESD",
  "ISD",
  "MMD",
  "FI",
  "Management",
  "Manpower",
  "HR",
  "Facility",
];

function Userform({ equip }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [value, setValue] = useState("");
  const [empname, setEmpname] = useState(null);
  const [searchstring, setSearchstring] = useState("ESD");
  const [datefrom, setDatefrom] = useState(new Date());
  const [dateto, setDateto] = useState(null);
  const [equipment, setEquipment] = useState({})

  const debouncedValue = useDebounce(value, 200);

  useEffect(() => {
    //Write Your Function Here!!
    console.log("EXAMPLE FETCH CALL:", debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/usermaster/${value}`);
      const json = await result.json();

      setEmpname(json.empname);
    })();
  }, [debouncedValue]);


  // useEffect(() => {
  //   (async () => {
  //     const result = await fetch(`/api/calibequipmentcustody/${equip}`);
  //     const json = await result.json();

  //     setEquipment(json);
  //     console.log(equipment)
  //   })();
  // }, [equip]);


  const getEmpnumber = (e) => setValue(e.target.value);

  const onSubmit = async (data) => {
    data = { ...data, equip, user: "suresh", datefrom, dateto };
    console.log(data);
    await fetch("/api/calibequipmentcustody", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    toast.success("submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    reset();
    setEmpname(null);
    setValue("");
    setSearchstring("ESD");

    // router.reload();
  };

  const onErrors = (errors) => console.error(errors);
  return (
    <main className="w-full min-h-full p-1">
      <div className="flex justify-center bg-orange-50/90 align-middle">
        <form onSubmit={handleSubmit(onSubmit, onErrors)}>
          <div className="w-full border-r-2 border-slate-900 pr-2">
            {/* the form */}

            <div className="flex flex-col ">
              <div className="flex flex-col sm:flex-row items-center">
                <h2 className="font-black text-[14px] mr-auto text-sky-900 tracking-wider">
                  Equipment Custody Information:
                </h2>
                <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
              </div>

              <div className="mt-5">
                <div>
                  <div className="md:flex flex-row md:space-x-4 w-full text-xs">
                    {/* equipment complete name */}
                    <div className="mb-3 space-y-2 w-full text-xs">
                      <label className="font-semibold text-gray-600 py-2">
                        Custodian Emp Number: <abbr title="required">*</abbr>
                      </label>
                      <input
                        placeholder="Employee Number"
                        className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                        required="required"
                        type="text"
                        name="empnumber"
                        id="empnumber"
                        {...register("empnumber")}
                        onChange={getEmpnumber}
                      />
                    </div>

                    <div className="mb-3 space-y-2 w-full text-xs">
                      <label className="font-semibold text-gray-600 py-2">
                        Employee Name: <abbr title="required">*</abbr>
                      </label>
                      <input
                        placeholder="Employee Name"
                        className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                        required="required"
                        type="text"
                        name="empname"
                        id="empname"
                        value={empname}
                        {...register("empname")}
                      />
                    </div>

                    <div className="mb-3 space-y-2 w-full text-xs">
                      <label className="font-semibold text-gray-600 py-2 w-1/2">
                        Department <abbr title="required">*</abbr>
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="dept"
                          className="placeholder:text-[10px] placeholder:font-Roboto placeholder:text-red-800 border-0 border-none appearance-none w-2/3  focus:border-none focus:border-0 focus:outline-none "
                          placeholder="...type char to search.."
                          id="dept"
                          onChange={(e) => setSearchstring(e.target.value)}
                        />

                        <input
                          placeholder="Department"
                          className="appearance-none font-bold block w-full bg-grey-lighter text-grey-darker h-5 py-4 ml-3"
                          required="required"
                          type="text"
                          name="department"
                          id="department"
                          value={departments.filter((str) =>
                            str.includes(useDebounce(searchstring, 200))
                          )}
                          {...register("department", {
                            required:
                              "department name has to be searched and filled",
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:flex md:flex-row md:space-x-4 w-full text-xs ">
                    <div className="w-full flex flex-col mb-3">
                      <label className="font-semibold text-gray-600 py-2 ">
                        Equipment used in project:
                      </label>
                      <input
                        placeholder="Project Name"
                        className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                        type="text"
                        name="project"
                        id="project"
                        {...register("project", {
                          required: "project where Equipment used is required",
                        })}
                      />
                    </div>
                    <div className="w-full flex flex-col mb-3">
                      <label className="font-semibold text-gray-600 py-2">
                        Rack/bin (if custody by warehouse){" "}
                        <abbr title="required">*</abbr>
                      </label>
                      <input
                        className="block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4 md:w-full "
                        required="required"
                        type="text"
                        name="racklocation"
                        id="racklocation"
                        {...register("racklocation")}
                      ></input>
                      <p
                        className="text-sm text-red-500 hidden mt-3"
                        id="error"
                      >
                        Please fill out this field.
                      </p>
                    </div>
                  </div>

                  <div className="md:flex md:flex-row md:space-x-4 w-full text-xs">
                    <div className="w-full flex flex-col mb-3">
                      <label className="font-semibold text-gray-600 py-2">
                        Equipment custody from: <abbr title="required">*</abbr>
                      </label>
                      <DatePicker
                        className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        selected={datefrom}
                        onChange={(date) => {
                          setDatefrom(date);
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
                        Equipment custody to
                      </label>
                      <DatePicker
                        className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        selected={dateto}
                        onChange={(date) => {
                          setDateto(date);
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
                      Remarks if any :
                    </label>
                    <textarea
                      name="remarks"
                      id="remarks"
                      className=" min-h-[100px] max-h-[300px] h-28 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4"
                      placeholder="Enter remakrs/comments if any...."
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

        <div className="w-1/4 h-full flex flex-col justify-center align-bottom pl-2">
          <div className="bg-orange-900 mt-24 py-2">
            <h1 className="text-white text-sm font-bold">
              {" "}
              Info on the user/custodian of equipment: {equip}
            </h1>
          </div>
          <h3 className=" mt-20 font-thin leading-9 italic text-[12px] tracking-wider font-Roboto">
            Custody information of this equipment will be entered by
            <span className="font-bold text-stone-900">
              {" "}
              warehouse equipment coordinator{" "}
            </span>
            here.
          </h3>
        </div>
      </div>
    </main>
  );
}

export default Userform;

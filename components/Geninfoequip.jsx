import React, {useState, useEffect} from "react";
import  { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";

function Geninfoform({ equip }) {

  const router = useRouter()

  

  // const [geninfo, setGeninfo] = useState([])

  // useEffect(() => {
  //   (async () => {
  //     const result = await fetch(`/api/calibequipment/${equip}`);
  //     const json = await result.json();

  //     setGeninfo(json);
  //   })();
  // }, [equip]);

  // console.log(geninfo)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) =>  {
    data = {...data, equip, user:"suresh"}
    console.log(data)
    await fetch("/api/calibequipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    await fetch(`/api/fixedassets/genInfo/${equip}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
            
    })


    toast.success("submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    reset()
    
    router.reload();
  };

  const onErrors = (errors) => console.error(errors);

  return (
    <main className="w-full min-h-full">
      <div className="flex justify-center bg-sky-100 align-middle">
        <div className="w-1/2 h-full flex flex-col justify-center align-bottom">
          <div className="bg-teal-900 mt-24 py-2"><h1 className="text-white text-sm font-bold"> General Info on the equipment: {equip} </h1></div>
          <h3 className=" mt-20 font-thin leading-9 italic text-[12px] tracking-wider font-Roboto">
            
            All general information on this equipment will be entered by  
            <span className="font-bold text-zinc-900"> department equipment coordinator </span> and <span className="font-bold text-stone-900"> warehouse equipment coordinator </span>
            here.
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit, onErrors)}>
        <div className="w-full border-l-2 border-slate-900 pl-3">
          {/* the form */}

          <div className="flex flex-col ">

            <div className="flex flex-col sm:flex-row items-center">
              <h2 className="font-black text-[14px] mr-auto text-sky-900 tracking-wider">
                Equipment general Information:
              </h2>
              <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
            </div>

            <div className="mt-5">
              <div className="form">
                <div className="md:flex flex-row md:space-x-4 w-full text-xs">
                  {/* equipment complete name */}
                  <div className="mb-3 space-y-2 w-full text-xs">
                    <label className="font-semibold text-gray-600 py-2">
                      Equipment Technical Name <abbr title="required">*</abbr>
                    </label>
                    <input
                      placeholder="Technical Name"
                      className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                      required="required"
                      type="text"
                      name="technicalname"
                      id="technicalname"
                      {...register("technicalname", {
                        required: "Equipment Technical name is required",
                      })}
                    />
                    
                     <p className="text-[10px] text-red-900">
                    {errors?.technicalname && errors.technicalname.message}
                  </p>
                  </div>

                  <div className="mb-3 space-y-2 w-full text-xs">
                    <label className="font-semibold text-gray-600 py-2">
                      Equipment Manufacturer <abbr title="required">*</abbr>
                    </label>
                    <input
                      placeholder="OEM/Manufacturer"
                      className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                      required="required"
                      type="text"
                      name="manufacturer"
                      id="manufacturer"
                      {...register("manufacturer", {
                        required: "Equipment OEM/Manufacturer name is required",
                      })}
                    />
                     <p className="text-[10px] text-red-900">
                    {errors?.manufacturer && errors.manufacturer.message}
                  </p>
                  </div>

                  <div className="mb-3 space-y-2 w-full text-xs">
                    <label className="font-semibold text-gray-600 py-2">
                      Model Number <abbr title="required">*</abbr>
                    </label>
                    <input
                      placeholder="Model Number"
                      className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                      required="required"
                      type="text"
                      name="model"
                      id="model"
                      {...register("model", {
                        required: "Equipment Model is required",
                      })}

                    />
                    <p className="text-[10px] text-red-900">
                    {errors?.model && errors.model.message}
                  </p>
                  </div>            
                </div>

               

                <div className="mb-3 space-y-2 w-2/3 text-xs">
                  <label className=" font-semibold text-gray-600 py-2">
                    Equipment website (brochure/technical details)
                  </label>
                  <div className="flex flex-wrap items-stretch w-full mb-4 relative">
                    <div className="flex">
                      <span className="flex  leading-normal bg-grey-lighter border-1 rounded-r-none border border-r-0 border-blue-300 px-3 whitespace-no-wrap text-grey-dark  w-12 h-10 bg-blue-300 justify-center items-center  text-xl rounded-lg text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="flex-shrink flex-grow flex-auto leading-normal w-px  border border-l-0 h-10 border-grey-light rounded-lg rounded-l-none px-3 relative focus:border-blue focus:shadow"
                      placeholder="https://"
                      name="website"
                      id="website"
                      {...register("website", )}
                      
                    />
                  </div>
                </div>

                <div className="md:flex md:flex-row md:space-x-4 w-full text-xs">
                  <div className="w-full flex flex-col mb-3">
                    <label className="font-semibold text-gray-600 py-2">
                     Serial Number
                    </label>
                    <input
                      placeholder="Serial Number..."
                      className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                      type="text"
                      name="serialnumber"
                      id="serialnumber"
                      {...register("serialnumber", )}
                    />
                  </div>
                  <div className="w-full flex flex-col mb-3">
                    <label className="font-semibold text-gray-600 py-2">
                      Legacy Asset Number: <abbr title="required">*</abbr>
                    </label>
                    <input
                      placeholder="Old asset number..."
                      className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                      type="text"
                      name="oldassetnumber"
                      id="oldassetnumber"
                      {...register("oldassetnumber", )}
                    />
                    
                  </div>
                </div>
               

                <div className="md:flex md:flex-row md:space-x-4 w-full text-xs">
                  <div className="w-full flex flex-col mb-3">
                    <label className="font-semibold text-gray-600 py-2">
                      Application/used for:
                    </label>
                    <input
                      placeholder="Application"
                      className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4"
                      type="text"
                      name="application"
                      id="application"
                      {...register("application", )}
                    />
                  </div>
                  <div className="w-full flex flex-col mb-3">
                    <label className="font-semibold text-gray-600 py-2">
                      To calibrate? <abbr title="required">*</abbr>
                    </label>
                    <select
                      className="block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-10 px-4 md:w-full "
                      required="required"
                      name="calibflag"
                      id="calibflag"
                      {...register("calibflag", )}
                    >
                      <option value="">Select whether calibration is required:</option>
                      
                      <option value="Yes">Yes</option>
                      <option value="No">No Need</option>
                      
                    </select>
                    
                  </div>
                </div>
                <div className="flex-auto w-full mb-1 text-xs space-y-2">
                  <label className="font-semibold text-gray-600 py-2">
                    Details & Description of Accessories:
                  </label>
                  <textarea
                    name="accessories"
                    id="accessories"
                    className=" min-h-[60px] max-h-[120px] h-20 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4"
                    placeholder="Enter complete details and accessories list"
                    spellCheck="false"
                    {...register("accessories", )}
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
                  <button type="submit" className="mb-2 md:mb-0 bg-green-400 px-5 py-2 text-[12px] shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-green-500">
                    Save
                  </button>
                </div>
              </div>
            </div>


          </div>
        </div>
        </form>
      </div>
    </main>
  );
}

export default Geninfoform;

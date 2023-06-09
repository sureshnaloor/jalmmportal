import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Mateditcomponent({ material, matgroupdet, setShowModal, editmode }) {
  const [matrl, setMatrl] = useState([]); // this is for already commented data if any
  
  const [matgroups, setMatgroups] = useState([]); // for select matgroups to change the matgroup if wrong
  console.log(material);

  const [newdescription, setNewdescription] = useState("");
  const [length, setLength] = useState(0);
  const [maxLimit, setMaxlimit] = useState(40);

  const [mattypes, setMattypes] = useState([])

  const [materialedited, setMaterialedited] = useState({}); // for already edited data

  const [mattypeselected, setMattypeselected] = useState("ZOFC")

  const [longtextAI, setLongtextAI] = useState("")

  const mattypeChange = event => {
    console.log(event.target.value);
    setMattypeselected(event.target.value);
    
  };

  const [matgroupselected,setMatgroupselected] = useState("OFFICE CONSUMABLES")
  const [secondarymatgroupselected, setSecondarymatgroupselected] = useState("GIFT ITEMS")

  const matgroupChange = event => {
    setMatgroupselected(event.target.value)
  }

  const secondaryMatgrpchange = event => {
    setSecondarymatgroupselected(event.target.value)
  }
  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/materialcleanse/comments/${material["material-code"]}`
      );
      const json = await result.json();
      setMatrl(json);
    })();
  }, [material]);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/materialcleanse/comments/${material["material-code"]}`
      );
      const json = await result.json();
      setLongtextAI(json);
    })();
  }, [material]);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/materialcleanse/${material["material-code"]}`
      );
      const json = await result.json();
      setMaterialedited(json);
    })();
  }, [material]);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/mattypes`
      );
      const json = await result.json();
      setMattypes(json);
    })();
  }, []);

  console.log(mattypes);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/materialcleanse/placeholder/${material["matgroupid"]}`
      );
      const json = await result.json();
      // setPlaceholder(json);
    })();
  }, [material]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/matgroup`);
      const json = await result.json();
      setMatgroups(json);
    })();
  }, [material]);
 

  const handleEdit = async (e) => {
    const responsebody = {};
    const body = {};
    // console.log("clicked");
    e.preventDefault();
    const data = new FormData(e.target);
    data.forEach((value, property) => {
      responsebody[property] = value;
    });

    body = {
      materialcode: material["material-code"],
      matdescriptionold: material["material-description"],
      matgroupold: material["matgroupid"],
      mattypeold: material["material-type"],
      matdescriptionnew:
        responsebody["primary"] +
        " " +
        responsebody["secondary"] +
        " " +
        responsebody["tertiary"] +
        " " +
        responsebody["other"],
      mattypenew: responsebody["mattypenew"],
      matgroupnew: responsebody["matgroupnew"],
      longtext: responsebody["longtext"],
    };

    // console.log(JSON.stringify(responsebody));
    // console.log(body)
    // console.log(JSON.stringify(body))
    const result = await fetch(
      `/api/materialcleanse/${material["material-code"]}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );
    const json = await result.json();
    toast.success("Commented succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    // console.log(json)
  };

  const handlecomment = async (e) => {
    const responsebody = {};
    const body = {};
    // console.log("clicked");
    e.preventDefault();
    const data = new FormData(e.target);
    data.forEach((value, property) => {
      responsebody[property] = value;
    });

    body = {
      materialcode: material["material-code"],
      matdescriptionold: material["material-description"],
      matgroupold: material["matgroupid"],
      mattypeold: material["material-type"],
      matdescriptionnew:
        responsebody["primary"] +
        " " +
        responsebody["secondary"] +
        " " +
        responsebody["tertiary"] +
        " " +
        responsebody["other"],
      mattypenew: responsebody["mattypenew"],
      matgroupnew: responsebody["matgroupnew"],
      longtext: responsebody["longtext"],
      username: session?.user?.name || "anonymous",
    };

    // console.log(JSON.stringify(responsebody));
    // console.log(body)
    // console.log(JSON.stringify(body))
    const result = await fetch(
      `/api/materialcleanse/comments/${material["material-code"]}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );
    const json = await result.json();

    toast.success(
      `The material comment is successful! thanks ${session?.user?.name}`,
      {
        position: "bottom-center",
      }
    );

    setTimeout(() => setShowModal(false), 3000);
    // console.log(json)
  };

  return (
    // <div className="absolute inset-0 w-[100vw] h-full flex  opacity-90 bg-gray-50 justify-center  z-50 align-middle">
    <div className="fixed inset-0 z-40 w-full h-full bg-stone-400 opacity-100">
      {/* <div className="w-[60vw] p-12 border-2 bg-stone-300 border-gray-900 b opacity-100">  */}
      <div className="fixed inset-1/2 z-50 w-[90%] h-[90%] justify-center align-middle -translate-x-1/2 -translate-y-1/2 bg-white opacity-100 rounded-[20px] border-r-2 border-b-2 ">
        <button
          className="fixed top-5 right-5 text-[14px] font-semibold text-amber-900 bg-green-600 px-3 py-1 border-2 hover:text-white hover:bg-red-600"
          onClick={() => setShowModal(false)}
        >
          X
        </button>

        

        <div className="grid grid-cols-8 gap-2">
          <div className="col-span-3 border-r-4 border-sky-800 px-6 py-3 flex flex-col">
            <h2 className="bg-sky-600 mx-auto px-9 py-1 text-white text-xs uppercase tracking-wider mb-3">
              {" "}
              {editmode
                ? "Material to edit:"
                : "Suggest suitable description for:"}
            </h2>

            <div className="w-full bg-sky-100 flex-col px-3 mb-9">
              <div className="flex flex-row justify-between mb-6">
                <p className="text-gray-700 text-xs pb-3"> Material Code: </p>
                <h5 className="text-sky-900 text-sm font-semibold ">
                  {material["material-code"]}
                </h5>
              </div>

              <div className="flex flex-row justify-between">
                <p className="text-gray-700 text-xs pb-2">
                  Existing Material Description:{" "}
                </p>
                <h5 className="text-zinc-900 text-xs font-bold ">
                  {material["material-description"]}
                </h5>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-gray-700 text-xs pb-2">
                  Existing Material Type:{" "}
                </p>
                <h5 className="text-sky-900 text-xs font-semibold">
                  {material["material-type"]}
                </h5>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-gray-700 text-xs pb-1">
                  Existing Material Group:{" "}
                </p>
                <h5 className="text-zinc-900 text-xs font-bold pb-3">
                  {material["matgroupid"]}{" "}
                  <span> {matgroupdet["matgroup-primary-desc"]}</span>
                </h5>
              </div>
            </div>
          </div>
          <div className="col-span-4 pt-4">
            {matrl.length > 0 ? (
              <table className="mt-3 mb-3 pb-3">
                <thead>
                  <tr className="font-semibold text-xs bg-sky-800 text-yellow-200 max-h-44">
                    <th>Material code</th>
                    <th>Suggested Material description</th>
                    <th>Suggested Material Type</th>
                    <th>Suggested Material Group</th>
                    <th>Contributed User</th>
                  </tr>
                </thead>
                <tbody className="bg-blue-100 text-xs">
                  {matrl.map((row, index) => (
                    <tr
                      key={index}
                      className="font-semibold text-xs bg-sky-800 text-white"
                    >
                      <td>{row.materialcode}</td>
                      <td>{row.matdescriptionnew}</td>
                      <td>{row.mattypenew}</td>
                      <td>{row.matgroupnew}</td>
                      <td>{row.username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="mt-6 pt-6 flex justify-center">
                <h2 className=" py-3 px-3 bg-sky-100 tracking-widest text-sm">
                  {" "}
                  NO contribution from any user so far
                </h2>{" "}
              </div>
            )}
          </div>
        </div>

        {JSON.stringify(materialedited) === "{}" ? (
          <form
            className=" w-full bg-sky-300 p-1"
            onSubmit={editmode ? handleEdit : handlecomment}
          >
            <div className="shadow overflow-hidden  sm:rounded-md">
              <div className="px-2 py-2 flex flex-col bg-white sm:p-3 text-[10px]">
                <h3 className="w-1/4 bg-sky-600 mx-auto text-white uppercase px-2 py-2">
                  {" "}
                  Corrected Material description:{" "}
                </h3>

                <div className="grid grid-cols-9 bg-sky-800 border-b-2 gap-2 py-3 mt-4 mb-6 pb-6">
                  <div className="col-span-2 mx-auto">
                    <label
                      htmlFor="mattypenew"
                      className="block text-[10px] font-bold uppercase text-white"
                    >
                      Material Type - New/corrected (if required)
                    </label>
                    <select
                      id="mattypenew"
                      name="mattypenew"
                      autoComplete="mattypenew"
                      value={mattypeselected}
                      onChange={mattypeChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-Montserrat font-bold text-zinc-900 text-[10px]"
                    >
                      <option
                        value="ZCVL"
                        className="text-sky-900 text-[10px] font-bold"
                      >
                        ZCVL- Civil Materials
                      </option>
                      <option
                        value="ZMEC"
                        className="text-sky-900 text-[10px] font-bold"
                      >
                        ZMEC- Mechanical/Piping Materials
                      </option>
                      <option
                        value="ZOFC"
                        className="text-sky-900 text-[10px] font-bold"
                      >
                        ZOFC- Office/Camp consumables
                      </option>
                      <option
                        value="ZELC"
                        className="text-sky-900 text-[10px] font-bold"
                      >
                        ZELC- Electrical Materials
                      </option>
                      <option
                        value="ZINS"
                        className="text-sky-900 text-[10px] font-bold"
                      >
                        ZINS- Instrumentation Materials
                      </option>
                      <option
                        value="ZCHN"
                        className="text-purple-900 text-[10px] font-bold"
                      >
                        ZCHN- Channel Partner Materials
                      </option>
                      <option
                        value="UNBW"
                        className="text-purple-900 text-[10px] font-bold"
                      >
                        UNBW- Tools and equipment
                      </option>
                      <option
                        value="ERSA"
                        className="text-purple-900 text-[10px] font-bold"
                      >
                        ERSA- Spares
                      </option>
                      <option
                        value="VERP"
                        className="text-purple-900 text-[10px] font-bold"
                      >
                        VERP- Packaging Materials
                      </option>
                    </select>
                  </div>

                  <div className="col-span-3 mx-auto">
                    <label
                      htmlFor="matgroupnew"
                      className="block text-[10px] font-bold uppercase text-white px-9"
                    >
                      Material Group-Primary (Corrected)
                    </label>
                    <select
                      id="matgroupnew"
                      name="matgroupnew"
                      autoComplete="matgroupnew"
                      value={matgroupselected}
                      onChange={matgroupChange}
                      className="mt-1 block w-full py-2 px-3 border font-Montserrat font-bold text-stone-900 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-[10px]"
                    >
                      {mattypes.filter(mt => mt.materialtype == mattypeselected)
                        .sort((a, b) =>
                          a["matgroupprimary"] >
                          b["matgroupprimary"]
                            ? 1
                            : -1
                        ).map((item,i) => item["matgroupprimarydesc"]).filter(
                          (value, index, current_val) => current_val.indexOf(value) === index
                        )
                        .map((mg,idx) => (
                          <option
                            key={idx}
                            value={mg}
                            className="text-[12px] text-sky-900 font-bold"
                          >
                            {mg}
                          </option>
                        )
                        
                        )}
                    </select>
                  </div>

                  <div className="col-span-4">
                    <label
                      htmlFor="matgroupnew"
                      className="block text-[10px] tracking-wider font-bold uppercase text-white px-12"
                    >
                      Material Group-Secondary
                    </label>
                    <select
                      id="matgroupsec"
                      name="matgroupsec"
                      value={secondarymatgroupselected}
                      onChange={secondaryMatgrpchange}
                      autoComplete="matgroupsec"
                      className="mt-1 block w-3/4 py-2 px-3 border font-Montserrat font-bold text-stone-900 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-[10px]"
                    >
                       {mattypes.filter(mt => mt.matgroupprimarydesc == matgroupselected)
                      .map((mg,idx) => (
                        <option
                          key={idx}
                          value={mg["datgroupsecondarydesc"]}
                          className="text-[12px] text-sky-900 font-bold"
                        >
                          {mg["datgroupsecondarydesc"]}
                        </option>
                      ))}
                      
                      
                    </select>
                  </div>
                </div>
                <div className="bg-zinc-100 pt-3">
                  <div className="grid grid-cols-10 gap-2 mt-1">
                    <div className="col-span-2">

                     
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="primary"
                          id="primary"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                          placeholder=" "
                          required
                          onBlur={(e) => {
                            setNewdescription(
                              (prev, current) =>
                                (current = prev + " " + e.target.value)
                            );
                            setLength(
                              (prev, current) =>
                                (current = prev + e.target.value.length + 1)
                            );
                          }}
                        />
                        <label
                          htmlFor="floating_company"
                          className="peer-focus:font-medium opacity-50  absolute text-[12px] text-gray-900 font-bold dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          {mattypes.filter(obj => obj["datgroupsecondarydesc"] === secondarymatgroupselected).map(ele => ele["primarydescplaceholder"])}
                        </label>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="secondary"
                          id="secondary"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                          placeholder=" "
                          required
                          onBlur={(e) => {
                            setNewdescription(
                              (prev, current) =>
                                (current = prev + " " + e.target.value)
                            );
                            setLength(
                              (prev, current) =>
                                (current = prev + e.target.value.length + 1)
                            );
                          }}
                        />
                        <label
                          htmlFor="floating_company"
                          className="peer-focus:font-medium opacity-30 absolute text-[12px] text-gray-900 font-bold dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          {mattypes.filter(obj => obj["datgroupsecondarydesc"] === secondarymatgroupselected).map(ele => ele["secondarydescplaceholder"])}
                        </label>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="tertiary"
                          id="tertiary"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                          placeholder=" "
                          required
                          onBlur={(e) => {
                            setNewdescription(
                              (prev, current) =>
                                (current = prev + " " + e.target.value)
                            );
                            setLength(
                              (prev, current) =>
                                (current = prev + e.target.value.length + 1)
                            );
                          }}
                        />
                        <label
                          htmlFor="floating_company"
                          className="peer-focus:font-medium opacity-30   absolute text-[12px]  text-gray-900 font-bold dark:text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-sky-800 peer-focus:dark:text-sky-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          {mattypes.filter(obj => obj["datgroupsecondarydesc"] === secondarymatgroupselected).map(ele => ele["tertiarydescplaceholder"])}
                        </label>
                      </div>
                    </div>
                    <p className="col-span-3 mt-4 ml-12  bg-sky-500  text-white font-semibold uppercase text-[12px] px-2 py-2 mb-3">
                    length of new description:{" "}
                    <span className="font-bold text-red-900 pl-3 text-[14px]">
                      {length}
                    </span>
                  </p>
                  </div>
                  

                  <div className="w-full grid grid-cols-4">
                    <div className=" pt-2 col-span-2">
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="other"
                          id="other"
                          className="block py-2.5 px-0 w-3/5 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                          placeholder=" "
                          required
                          onFocus={() => setMaxlimit(40 - length)}
                          onBlur={(e) => {
                            setNewdescription(
                              (prev, current) =>
                                (current = prev + " " + e.target.value)
                            );
                          }}
                          onChange={(e) => {
                            setLength((prev, current) => (current = prev + 1));
                          }}
                          maxLength={maxLimit}
                        />
                        <label
                          htmlFor="floating_company"
                          className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          Other details (Ex. packing size)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-5 mb-3">
                  <label
                    htmlFor="longtext"
                    className="block text-[10px] font-extrabold uppercase text-amber-900 dark:text-white"
                  >
                    Large Text Description:{" "}
                  </label>
                  <input
                    name="longtext"
                    type="textarea"
                    value={longtextAI}
                    id="longtext"
                    className="block mt-1 text-[14px] w-full pb-6 text-gray-900 border border-gray-300 rounded-md bg-gray-50  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>

                {editmode ? (
                  <button className=" mx-auto  bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-1 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded">
                    Cleanse
                  </button>
                ) : (
                  <button className=" mx-auto bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-1 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded">
                    Comment
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-sky-100 w-full h-56 flex justify-center align-middle mt-15">
            {" "}
            <h3 className="text-2xl text-amber-900 uppercase font-extrabold ">
              {" "}
              already edited{" "}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mateditcomponent;

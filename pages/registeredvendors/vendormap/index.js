import React, { useState, useEffect } from "react";

import { useRouter } from "next/router";

import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderComponent from "../../../components/HeaderComponent";

function Vendormap() {
  const { data: session } = useSession();
  const router = useRouter();
  const { vendor } = router.query;

  const handleMatgroupadd = async () => {
    console.log(
      " will now put into mongodb collection of mg mapped to vendors"
    );
    console.log(mattypeselected, matgroupselected, secondarymatgroupselected);
    let body = {
      mattypeselected,
      matgroupselected,
      secondarymatgroupselected,
      user: session.user.name,
    };

    const result = await fetch(`/api/registeredvendors/matgroupmap/${vendor}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    });

    toast.success("new request made succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.push(`/notyetqualifiedvendors`);
  };

  const [mattypes, setMattypes] = useState([]);
  // const [filteredMattypes, setFilteredmattypes] = useState([])

  const mattypeChange = (event) => {
    // console.log(event.target.value);
    setMattypeselected(event.target.value);
  };
  const [mattypeselected, setMattypeselected] = useState("");

  const [matgroupselected, setMatgroupselected] = useState("");
  const [secondarymatgroupselected, setSecondarymatgroupselected] =
    useState("");

  const matgroupChange = (event) => {
    setMatgroupselected(event.target.value);
  };

  const secondaryMatgrpchange = (event) => {
    setSecondarymatgroupselected(event.target.value);
  };

  const [mappedgroups, setMappedgroups] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/mattypes`);
      const json = await result.json();
      setMattypes(json);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/registeredvendors/matgroupmap/${vendor}`
      );
      const json = await result.json();
      setMappedgroups(json);
    })();
  }, []);

  console.log(mappedgroups);

  const Matgroups = () => {
    return (
      <>
        <div>
          <div className="grid grid-cols-12 border-b-2 gap-2 py-3 mt-4 mb-6 pb-6">
            <div className="col-span-3 mx-auto">
              <label
                htmlFor="mattypenew"
                className="block text-[10px] font-bold uppercase text-zinc-600"
              >
                Material Type
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
                  className="text-zinc-900 text-[10px] font-bold"
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
              </select>
            </div>

            <div className="col-span-3 mx-auto">
              <label
                htmlFor="matgroupnew"
                className="block text-[10px] font-bold uppercase text-zinc-600 px-9"
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
                {mattypes
                  .filter((mt) => mt.materialtype == mattypeselected)
                  .sort((a, b) =>
                    a["matgroupprimary"] > b["matgroupprimary"] ? 1 : -1
                  )
                  .map((item, i) => item["matgroupprimarydesc"])
                  .filter(
                    (value, index, current_val) =>
                      current_val.indexOf(value) === index
                  )
                  .map((mg, idx) => (
                    <option
                      key={idx}
                      value={mg}
                      className="text-[10px] text-sky-900 font-bold"
                    >
                      {mg}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-span-3">
              <label
                htmlFor="matgroupsecnew"
                className="block text-[10px] tracking-wider font-bold uppercase text-zinc-600 px-12"
              >
                Material Group-Secondary
              </label>
              <select
                id="matgroupsecnew"
                name="matgroupsecnew"
                value={secondarymatgroupselected}
                onChange={secondaryMatgrpchange}
                autoComplete="matgroupsec"
                className="mt-1 block w-3/4 py-2 px-3 border font-Montserrat font-bold text-stone-900 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-[10px]"
              >
                {mattypes
                  .filter((mt) => mt.matgroupprimarydesc == matgroupselected)
                  .map((mg, idx) => (
                    <option
                      key={idx}
                      value={mg["matgroupsecondarydesc"]}
                      className="text-[10px] text-sky-900 font-bold"
                    >
                      {mg["matgroupsecondarydesc"]}
                    </option>
                  ))}
              </select>
            </div>
            <button onClick={handleMatgroupadd}> Add + </button>
            
          </div>
          <div className="w-3/4 flex justify-around bg-teal-400/40 text-stone-900 p-1 shadow-lg shadow-teal-400 mx-auto font-bold tracking-wider">
           <h4><span className="text-[12px] font-bold mr-3 text-stone-900"> Material type selected: </span>{mattypeselected}</h4>
           <h3> <span className="text-[12px] font-bold mr-3 text-sky-900"> Material primary group: </span> {matgroupselected}</h3> 
           <h3> <span className="text-[12px] font-bold mr-3 text-cyan-800"> Secondary group (optional):</span> {secondarymatgroupselected}</h3> 
           </div>
        </div>
      </>
    );
  };

  return (
    <>
      <HeaderComponent />

      <div className="w-1/2 mx-auto mt-3 bg-sky-600/80 py-3 shadow-md shadow-stone-400 text-white flex justify-center ">
        {" "}
        <h4 className="text-[14px]"> Already mapped groups: </h4>
      </div>

      <div>
        <table className="w-4/5 border-collapse border border-sky-500  mt-5 mx-auto">
          <thead>
            <tr className="bg-stone-200/50 text-zinc-900 border-b-2 border-slate-600">
              
              <th className="py-2 px-4 text-left">Material type</th>
              <th className="py-2 px-4 text-left">Primary Material group</th>
              <th className="py-2 px-4 text-left">
                Secondary Material group (optional)
              </th>
              
            </tr>
          </thead>

          <tbody>
            {mappedgroups?.sort((a,b) => a.type > b.type ? 1 : -1).sort((a,b) => a.group > b.group ? 1 : -1).map((mg, index) => (
              <tr key={index} className="bg-white border-b border-blue-500">
                <td className="py-2 px-4 text-[12px] font-black text-zinc-800"> {mg.type}</td>
                <td className="py-2 px-4 text-[11px] font-bold text-stone-600"> {mg.group}</td>
                <td className="py-2 px-4 text-[11px] font-semibold text-stone-600/80 italic"> {mg.secondarygroup}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-1/2 mx-auto mt-3 bg-sky-600/80 py-3 shadow-md shadow-stone-400 text-white flex justify-center ">
        {" "}
        <h4 className="text-[14px]"> To map new groups: </h4>
      </div>
      <div>
        <Matgroups />
      </div>
    </>
  );
}

export default Vendormap;

import React, { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Image from "next/image";

import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderComponent from "../../../components/HeaderComponent";
import FooterComponent from "../../../components/FooterComponent";

function Vendormap() {
  const { data: session } = useSession();
  const router = useRouter();
  const { vendor } = router.query;

  const [matgroupadd, setMatgroupadd] = useState([{ matgroup: "" }]);

  const handleMatgroupadd = () => {
    setMatgroupadd([...matgroupadd, {matgroup: ""}])
  }

  const [mattypes, setMattypes] = useState([]);
  // const [filteredMattypes, setFilteredmattypes] = useState([])

  const mattypeChange = (event) => {
    console.log(event.target.value);
    setMattypeselected(event.target.value);
  };
  const [mattypeselected, setMattypeselected] = useState("ZOFC");

  const [matgroupselected, setMatgroupselected] = useState("");
  const [secondarymatgroupselected, setSecondarymatgroupselected] =
    useState("");

  const matgroupChange = (event) => {
    setMatgroupselected(event.target.value);
  };

  const secondaryMatgrpchange = (event) => {
    setSecondarymatgroupselected(event.target.value);
  };

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/mattypes`);
      const json = await result.json();
      setMattypes(json);
    })();
  }, []);

  const Torecur = () => {
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
         <button
         onClick={handleMatgroupadd}
       >
         {" "}
         Add +{" "}
       </button>
       </div>
                
      
       </div>
    
       
      </>
    );
  };

  return (
    <>
      <div>Vendor mapping page for vendor: {vendor}</div>

      <div>
        {matgroupadd.map((mg, index) => (
          <div key={index}><Torecur /> </div>
        ))}
      </div>
    </>
  );
}

export default Vendormap;

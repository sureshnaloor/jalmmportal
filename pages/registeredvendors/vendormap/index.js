import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

    // router.push(`/notyetqualifiedvendors`);
    router.back();
  };

  const handleServicegroupadd = async () => {
    console.log(
      " will now put thse selected service groups into mongodb collection"
    );
    console.log(servicecategorySelected, servicesubcategorySelected);
    let body = {
      servicecategorySelected,
      servicesubcategorySelected,
      user: session.user.name,
    };

    const result = await fetch(
      `/api/registeredvendors/servicegroupmap/${vendor}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("new request made succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    // router.push(`/notyetqualifiedvendors`);
    router.back();
  };

  // material and service group selection

  const [selectedValue, setSelectedValue] = useState("material");

  const handleRadioChange = (value) => {
    setSelectedValue(value);
  };
  //service types

  const [servicetypes, setServicetypes] = useState([]);

  const [servicecategorySelected, setServicecategorySelected] = useState("");
  const [servicesubcategorySelected, setServicesubcategorySelected] =
    useState("");

  const servicecategoryChange = (event) => {
    // console.log(event.target.value);
    setServicecategorySelected(event.target.value);
  };

  const servicesubcategoryChange = (event) => {
    setServicesubcategorySelected(event.target.value);
  };

  // material types

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
      const result = await fetch(`/api/servicetypes`);
      const json = await result.json();
      setServicetypes(json);
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
            <button
              className="bg-emerald-400/80 text-zinc-800 font-bold text-[14px] rounded-xl h-2/3"
              onClick={handleMatgroupadd}
            >
              {" "}
              Add +{" "}
            </button>
          </div>
          <div className="w-3/4 flex justify-around bg-teal-400/40 text-stone-900 p-1 shadow-lg shadow-teal-400 mx-auto font-bold tracking-wider">
            <h4>
              <span className="text-[12px] font-bold mr-3 text-stone-900">
                {" "}
                Material type selected:{" "}
              </span>
              {mattypeselected}
            </h4>
            <h3>
              {" "}
              <span className="text-[12px] font-bold mr-3 text-sky-900">
                {" "}
                Material primary group:{" "}
              </span>{" "}
              {matgroupselected}
            </h3>
            <h3>
              {" "}
              <span className="text-[12px] font-bold mr-3 text-cyan-800">
                {" "}
                Secondary group (optional):
              </span>{" "}
              {secondarymatgroupselected}
            </h3>
          </div>
        </div>
      </>
    );
  };

  const Servicegroups = () => {
    return (
      <>
        <div>
          <div className="w-3/5 mx-auto grid grid-cols-12 border-b-2 gap-2 py-3 mt-4 mb-6 pb-6">
            <div className="col-span-5 w-full">
              <label
                htmlFor="servicecategory"
                className="block text-[10px] font-bold uppercase text-zinc-600"
              >
                Service Category:
              </label>
              <select
                id="servicecategory"
                name="servicecategory"
                autoComplete="servicecategory"
                value={servicecategorySelected}
                onChange={servicecategoryChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-Montserrat font-bold text-zinc-900 text-[10px]"
              >
                {/* {servicetypes
                              
                  .map((mg, idx) => (
                    <option
                      key={idx}
                      value={mg.servicecategory}
                      className="text-[10px] text-sky-900 font-bold"
                    >
                      {mg.servicecategory}
                    </option>
                  ))} */}

                <option
                  value="Rental"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Rental
                </option>

                <option
                  value="Electrical"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Electrical
                </option>

                <option
                  value="Mechanical"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Mechanical
                </option>

                <option
                  value="Civil"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Civil
                </option>

                <option
                  value="Piping"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Piping
                </option>

                <option
                  value="Training"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Training
                </option>

                <option
                  value="Vendor inspection"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Vendor inspection
                </option>

                <option
                  value="Logistics"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Logistics
                </option>

                <option
                  value="Third party services"
                  className="text-zinc-900 text-[10px] font-bold"
                >
                  Third party services
                </option>
              </select>
            </div>

            <div className="col-span-5">
              <label
                htmlFor="servicesubcategory"
                className="block text-[10px] font-bold uppercase text-zinc-600 px-9"
              >
                Service Sub Category:
              </label>
              <select
                id="servicesubcategory"
                name="servicesubcategory"
                autoComplete="servicesubcategory"
                value={servicesubcategorySelected}
                onChange={servicesubcategoryChange}
                className="mt-1 block w-full py-2 px-3 border font-Montserrat font-bold text-stone-900 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-[10px]"
              >
                {servicetypes
                  .filter((mt) => mt.servicecategory == servicecategorySelected)
                  .map((mg, idx) => (
                    <option
                      key={idx}
                      value={mg.servicesubcategory}
                      className="text-[10px] text-sky-900 font-bold"
                    >
                      {mg.servicesubcategory}
                    </option>
                  ))}
              </select>
            </div>

            <button
              className="col-span-2 bg-emerald-400/80 text-zinc-800 font-bold text-[14px] rounded-xl h-2/3"
              onClick={handleServicegroupadd}
            >
              {" "}
              Add +{" "}
            </button>
          </div>
          <div className="w-3/4 flex justify-around bg-teal-400/40 text-stone-900 p-1 shadow-lg shadow-teal-400 mx-auto font-bold tracking-wider">
            <h4>
              <span className="text-[12px] font-bold mr-3 text-stone-900">
                {" "}
                Service category selected:{" "}
              </span>
              {servicecategorySelected}
            </h4>
            <h3>
              {" "}
              <span className="text-[12px] font-bold mr-3 text-sky-900">
                {" "}
                Service sub category selected:
              </span>{" "}
              {servicesubcategorySelected}
            </h3>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <HeaderComponent />
      <p className="w-1/2 font-zinc-900 font-bold mx-auto border-b-4 border-emerald-800">
        {" "}
        Material/service groups dealt by vendor: {vendor}
      </p>

      <div className="w-1/2 mx-auto mt-3 uppercase tracking-wider bg-stone-200/60 py-3 shadow-md shadow-stone-400 text-white flex justify-center ">
        {" "}
        <h4 className="text-[14px] font-bold text-stone-900 tracking-wider">
          {" "}
          Already mapped groups:{" "}
        </h4>
      </div>
      <div>
        {mappedgroups.length > 0 ? (
          <div>
            <table className="w-4/5 border-collapse border border-sky-500  mt-5 mx-auto">
              <thead>
                <tr className="bg-stone-200/50 text-zinc-900 border-b-2 border-slate-600">
                  <th className="py-2 px-4 text-[12px] text-left">
                    Material type
                  </th>
                  <th className="py-2 px-4 text-[12px] text-left">
                    Primary Material group
                  </th>
                  <th className="py-2 px-4 text-[12px] text-left">
                    Secondary Material group (optional)
                  </th>
                </tr>
              </thead>

              <tbody>
                {mappedgroups
                  ?.sort((a, b) => (a.type > b.type ? 1 : -1))
                  .sort((a, b) => (a.group > b.group ? 1 : -1))
                  .map((mg, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b border-blue-500"
                    >
                      <td className="py-2 px-4 text-[12px] font-black text-zinc-800">
                        {" "}
                        {mg.type}
                      </td>
                      <td className="py-2 px-4 text-[11px] font-bold text-stone-600">
                        {" "}
                        {mg.group}
                      </td>
                      <td className="py-2 px-4 text-[11px] font-semibold text-stone-600/80 italic">
                        {" "}
                        {mg.secondarygroup}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="w-1/2 mx-auto flex justify-center mt-3 text-[12px] font-bold tracking-widest">
            {" "}
            NIL{" "}
          </p>
        )}
      </div>

      <div className="bg-emerald-50/90 w-4/5 mt-5  mx-auto border-2 border-slate-500/60 shadow-md shadow-emerald-600/80 mb-9">
      <div className="w-1/2 mx-auto mt-3 py-3 bg-emerald-200/60 shadow-md shadow-stone-400 text-white grid grid-cols-4">
        {" "}
        <h4 className="text-[14px] col-span-3 flex  justify-center text-zinc-900 font-bold tracking-wider">
          {" "}
          To map new groups:{" "}
        </h4>
        <div className="col-span-1 text-[12px] text-stone-900 font-black flex tracking-wider">
          <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
            <input
              type="radio"
              name="material"
              id="material"
              value="material"
              checked={selectedValue === "material"}
              onChange={() => handleRadioChange("material")}
            />
            <label
              className="mt-px inline-block pl-[0.15rem] opacity-50 hover:pointer-events-none"
              htmlFor="material"
            >
              Material
            </label>
          </div>
          <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
            <input
              type="radio"
              name="service"
              id="service"
              value="service"
              checked={selectedValue === "service"}
              onChange={() => handleRadioChange("service")}
            />
            <label
              className="mt-px inline-block pl-[0.15rem] opacity-50 hover:pointer-events-none"
              htmlFor="service"
            >
              Service
            </label>
          </div>
        </div>
      </div>
      <div>
        {selectedValue == "material" ? <Matgroups /> : <Servicegroups />}
      </div>
      </div>
      <FooterComponent /> 
    </>
  );
}

export default Vendormap;

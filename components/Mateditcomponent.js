import React, { useState, useEffect } from "react";

function Mateditcomponent({ material, setShowModal }) {
  const [matrl, setMatrl] = useState({});
  const [placeholder, setPlaceholder] = useState({});
  const [matgroups, setMatgroups] = useState([]);
  console.log(material);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/materialcleanse/${material["material-code"]}`
      );
      const json = await result.json();
      setMatrl(json);
    })();
  }, [material]);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/materialcleanse/placeholder/${material["matgroupid"]}`
      );
      const json = await result.json();
      setPlaceholder(json);
    })();
  }, [material]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/matgroup`);
      const json = await result.json();
      setMatgroups(json);
    })();
  }, [material]);

  // console.log(matrl);
  // console.log(placeholder);
  console.log(matgroups);

  return (
    // <div className="absolute inset-0 w-[100vw] h-full flex  opacity-90 bg-gray-50 justify-center  z-50 align-middle">
    <div className="fixed inset-0 z-40 w-full h-full bg-stone-900 opacity-100">
      {/* <div className="w-[60vw] p-12 border-2 bg-stone-300 border-gray-900 b opacity-100">  */}
      <div className="fixed inset-1/2 z-50 w-[90%] h-[90%] justify-center align-middle -translate-x-1/2 -translate-y-1/2 bg-white opacity-100 rounded-[20px] border-r-2 border-b-2 ">
        <button
          className="fixed top-5 right-5 text-2xl font-semibold text-amber-900 bg-green-600 px-3 py-1 border-2 hover:text-white hover:bg-red-600"
          onClick={() => setShowModal(false)}
        >
          X
        </button>

        <div className="flex mb-3 ">
          <div className="w-full md:w-1/2 px-3 my-3 md:mb-0">
            <h3 className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Material Code
            </h3>

            <p className="text-amber-900 text-sm font-extrabold">
              {material["material-code"]}
            </p>

            <h4 className="text-sky-900 text-sm font-bold">
              {" "}
              Material Group: {material["matgroupid"]}
            </h4>
          </div>
          <div className="w-full md:w-1/2 px-3 my-3">
            <h4 className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Existing Material Description:
            </h4>
            <p className="text-sky-900 text-sm font-extrabold">
              {material["material-description"]}
            </p>
          </div>
        </div>

        <form className=" w-full bg-zinc-300 p-6">
          <div className="shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 bg-white sm:p-6">
              <div className="grid grid-cols-8 gap-2">
                <div className="col-span-2">
                  <div className="relative z-0 w-full mb-6 group">
                    <input
                      type="text"
                      name="primary"
                      id="primary"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      required
                    />
                    <label
                      htmlFor="floating_company"
                      className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      {placeholder.primary}
                    </label>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="relative z-0 w-full mb-6 group">
                    <input
                      type="text"
                      name="secondary"
                      id="secondary"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      required
                    />
                    <label
                      htmlFor="floating_company"
                      className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      {placeholder.secondary}
                    </label>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="relative z-0 w-full mb-6 group">
                    <input
                      type="text"
                      name="tertiary"
                      id="tertiary"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      required
                    />
                    <label
                      htmlFor="floating_company"
                      className="peer-focus:font-medium absolute text-sm uppercase text-gray-400 dark:text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-sky-800 peer-focus:dark:text-sky-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      {placeholder.tertiary}
                    </label>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="relative z-0 w-full mb-6 group">
                    <input
                      type="text"
                      name="other"
                      id="other"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" "
                      required
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

              <div className="grid grid-cols-10 gap-2 mt-3">
                <div className="col-span-3">
                  <label
                    htmlFor="mattype"
                    className="block text-[10px] font-extrabold uppercase text-amber-900"
                  >
                    Material Type - New
                  </label>
                  <select
                    id="mattype"
                    name="mattype"
                    autoComplete="mattype"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-Montserrat font-bold text-zinc-900 text-sm"
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

                <div className="col-span-4">
                  <label
                    htmlFor="matgroup"
                    className="block text-[10px] font-extrabold uppercase text-amber-900"
                  >
                    Material Group-New
                  </label>
                  <select
                    id="matgroup"
                    name="matgroup"
                    autoComplete="matgroup"
                    className="mt-1 block w-full py-2 px-3 border font-Montserrat font-bold text-stone-900 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {matgroups
                      .sort((a, b) =>
                        a["matgroup-primary-desc"] > b["matgroup-primary-desc"]
                          ? 1
                          : -1
                      )
                      .map((mg) => (
                        <option
                          key={mg["_id"]}
                          value={mg["material-group"]}
                          className="text-[10px] text-sky-900 font-bold uppercase"
                        >
                          {mg["matgroup-primary-desc"].toLowerCase()}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="mb-6 mt-3">
                <label
                  htmlFor="largetext"
                  className="block text-[10px] font-extrabold uppercase text-amber-900 dark:text-white"
                >
                  Large Text Description:{" "}
                </label>
                <input
                  name="largetext"
                  type="textarea"
                  id="largetext"
                  className="block mt-3 w-full pb-6 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
              <button className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-1 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded">
                Cleanse
              </button>
            </div>
          </div>
        </form>
        {/* comment log */}
      </div>
    </div>
  );
}

export default Mateditcomponent;

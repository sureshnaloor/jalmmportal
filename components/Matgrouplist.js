import React from "react";
import Image from "next/image";
function Matgrouplist({ matgroups, id }) {
  return (
    <div >
      <section className="pt-10 lg:pt-[120px] pb-10 lg:pb-20 bg-[#F3F4F6]">
        <div className="container">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6 px-3">
              <div className="bg-white rounded-lg overflow-hidden mb-10 flex flex-col justify-center p-3">
                <Image
                  width={"100%"}
                  height={"100%"}
                  src="/images/civil.jpg"
                  alt="civil materials"
                />
                <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                    <a
                      href="#"
                      className="
                        font-semibold
                        text-dark text-xl
                        dark:text-black
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-pink-600
                        "
                    >
                      Civil Materials
                    </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                    <label
                      htmlFor="countries"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                      Select Material Group
                    </label>

                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      {matgroups.filter(mg => {
                        return mg["material-group"][0]=="C" 
                      }).map((mg) => (
                        // eslint-disable-next-line react/jsx-key
                        <option key={mg["_id"]} value={mg["material-group"]}>
                          {mg["matgroup-primary-desc"]}
                        </option>
                      ))}
                    </select>
                  </p>
                  <a
                    href="#"
                    className="
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-body-color
                     dark: text-orange-900
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-blue-900 dark:hover:text-red-500
                     transition
                     "
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6 px-3">
              <div className="bg-white rounded-lg overflow-hidden mb-10 flex flex-col justify-center p-3">
                <Image
                  width={"100%"}
                  height={"100%"}
                  src="/images/electrical.jpg"
                  alt="electrical materials"
                />
                <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                    <a
                      href="#"
                      className="
                        font-semibold
                        text-dark text-xl
                        dark:text-black
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-blue-300
                        "
                    >
                      Electrical Materials
                    </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                  <label
                      htmlFor="countries"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                      Select Material Group
                    </label>

                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      {matgroups.filter(mg => {
                        return mg["material-group"][0]=="E" 
                      }).map((mg) => (
                        // eslint-disable-next-line react/jsx-key
                        <option key={mg["_id"]} value={mg["material-group"]}>
                          {mg["matgroup-primary-desc"]}
                        </option>
                      ))}
                    </select>
                  </p>
                  <a
                    href="#"
                    className="
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-body-color
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6 px-3">
              <div className="bg-white rounded-lg overflow-hidden mb-10 flex flex-col justify-items-center p-3">
                <Image
                  width={"100"}
                  height={"100"}
                  src="/images/mechanical.jpg"
                  alt="mechanical materials"
                />
                <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                    <a
                      href="#"
                      className="
                        font-semibold
                        text-dark text-xl
                        dark:text-black
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-red-600
                        "
                    >
                      Mechanical Materials
                    </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                  <label
                      htmlFor="countries"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                      Select Material Group
                    </label>

                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      {matgroups.filter(mg => {
                        return mg["material-group"][0]=="M" 
                      }).map((mg) => (
                        // eslint-disable-next-line react/jsx-key
                        <option key={mg["_id"]} value={mg["material-group"]}>
                          {mg["matgroup-primary-desc"]}
                        </option>
                      ))}
                    </select>
                  </p>
                  <a
                    href="#"
                    className="
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-body-color
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6 px-3">
              <div className="bg-white rounded-lg overflow-hidden mb-10 flex flex-col justify-items-center p-3">
                <Image
                  width={"100"}
                  height={"100"}
                  src="/images/instrumentation.jpg"
                  alt="instrumentation materials"
                />
                <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                    <a
                      href="#"
                      className="
                        font-semibold
                        text-dark text-xl
                        dark:text-black
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-gray-600
                        "
                    >
                      Instrumentation Materials
                    </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                  <label
                      htmlFor="countries"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                      Select Material Group
                    </label>

                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      {matgroups.filter(mg => {
                        return mg["material-group"][0]=="I" && mg["material-group"][1] == "M"
                      }).map((mg) => (
                        // eslint-disable-next-line react/jsx-key
                        <option key={mg["_id"]} value={mg["material-group"]}>
                          {mg["matgroup-primary-desc"]}
                        </option>
                      ))}
                    </select>
                  </p>
                  <a
                    href="#"
                    className="
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-body-color
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6 px-3">
              <div className="bg-white rounded-lg overflow-hidden mb-10 flex flex-col justify-items-center p-3">
                <Image
                  width={"100"}
                  height={"100"}
                  src="/images/computers.jpg"
                  alt="IT Materials"
                />
                <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                    <a
                      href="#"
                      className="
                        font-semibold
                        text-dark text-xl
                        dark:text-black
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-green-600
                        "
                    >
                      IT Materials
                    </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                  <label
                      htmlFor="countries"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                      Select Material Group
                    </label>

                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      {matgroups.filter(mg => {
                        return mg["material-group"][0]=="I" && mg["material-group"][1] == "T"
                      }).map((mg) => (
                        // eslint-disable-next-line react/jsx-key
                        <option key={mg["_id"]} value={mg["material-group"]}>
                          {mg["matgroup-primary-desc"]}
                        </option>
                      ))}
                    </select>
                  </p>
                  <a
                    href="#"
                    className="
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-body-color
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/6 px-3">
              <div className="bg-white rounded-lg overflow-hidden mb-10 flex flex-col justify-items-center p-3">
                <Image
                  width={"100"}
                  height={"100"}
                  src="/images/stationary.jpg"
                  alt="Office consumables"
                />
                <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                  <h3>
                    <a
                      href="#"
                      className="
                        font-semibold
                        text-dark text-xl
                        dark:text-black
                        sm:text-[22px]
                        md:text-xl
                        lg:text-[22px]
                        xl:text-xl
                        2xl:text-[22px]
                        mb-4
                        block
                        hover:text-purple-600
                        "
                    >
                      Office Materials
                    </a>
                  </h3>
                  <p className="text-base text-body-color leading-relaxed mb-7">
                  <label
                      htmlFor="countries"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                      Select Material Group
                    </label>

                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      {matgroups.filter(mg => {
                        return mg["material-group"][0] == "A"
                      }).map((mg) => (
                        // eslint-disable-next-line react/jsx-key
                        <option key={mg["_id"]} value={mg["material-group"]}>
                          {mg["matgroup-primary-desc"]}
                        </option>
                      ))}
                    </select>
                  </p>
                  <a
                    href="#"
                    className="
                     inline-block
                     py-2
                     px-7
                     border border-[#E5E7EB]
                     rounded-full
                     text-base text-body-color
                     font-medium
                     hover:border-primary hover:bg-primary hover:text-white
                     transition
                     "
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Matgrouplist;

import React from "react";

function Vendorevaluation() {
  return (
    <div>
      <form>
        <fieldset className="bg-zinc-100">
          <h4 className="text-sky-500"> Fixed Parameters: </h4>
          <div className="flex justify-between">
            {/* first  */}
            <div className="mb-1 px-0 bg-red-200 mx-2">
              <label
                htmlFor="exampleNumber0"
                className="form-label text-[10px] mb-2 text-gray-700"
              >
                Quality Certification:
              </label>

              <ul className="text-[8px] px-3  font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-license"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-license"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      ISO 9001 certified{" "}
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-id"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-id"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      Has In-house QMS{" "}
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-millitary"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-millitary"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      No quality system
                    </label>
                  </div>
                </li>
              </ul>
            </div>

            {/* second  */}
            <div className="mb-1">
              <label
                htmlFor="exampleNumber0"
                className="form-label text-[10px] mb-2 text-gray-700"
              >
                Technical clarity of bids:
              </label>

              <ul className="text-[8px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-license"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-license"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      Submits all required with bid{" "}
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-id"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-id"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      Submits partially and on demand{" "}
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-millitary"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-millitary"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      Doesnt submit unless followed up repeatedly.
                    </label>
                  </div>
                </li>
              </ul>
            </div>

            {/* third */}
            <div className="mb-1">
              <label
                htmlFor="exampleNumber0"
                className="form-label text-[10px] mb-2 text-gray-700"
              >
                Quality Certification:
              </label>

              <ul className="text-[8px] font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-license"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-license"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      ISO 9001 certified{" "}
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-id"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-id"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      Has In-house QMS{" "}
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="list-radio-millitary"
                      type="radio"
                      value=""
                      name="list-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="list-radio-millitary"
                      className="w-full py-0  text-[8px] font-semibold text-gray-900 dark:text-gray-300"
                    >
                      {" "}
                      No quality system
                    </label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default Vendorevaluation;

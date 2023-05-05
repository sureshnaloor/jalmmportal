import React, {useState, useEffect} from "react";

function Vendorevaluation({ vendornumber }) {

  const [qtnsub, setQtnsub] = useState(0)
  const [payterm, setPayterm] = useState(0)
  const [quality, setQuality] = useState(0)
  const [clarity, setClarity] = useState(0)
  const [sales,setSales] = useState(0)

  const [totalscore, setTotalscore] = useState(0)

  return (
    <>
      <div className="bg-zinc-100 w-full">
        <div className="mx-auto w-5/6 drop-shadow rounded-md mb-9">
          <h1 className="text-[14px] tracking-wider font-semibold text-center text-black mb-10">
            Vendor evaluation for vendor code: {vendornumber}
          </h1>

          <h4 className="mb-3 pb-3 bg-zinc-100 font-bold font-italic tracking-widest"> The FIXED PARAMETERS: </h4>

          {/* <!-- The First FAQ --> */}
          <details className="bg-gray-300 open:bg-stone-100 duration-300 mb-9">
            <summary className="bg-inherit px-5 py-1 text-[14px] cursor-pointer">
              <h3 className="mb-1  font-semibold text-gray-900 dark:text-white">
                Timely Quotation Submission
              </h3>
            </summary>
            <div className="bg-white px-5 py-3 border border-gray-300 text-sm font-light">
              {/* horizontal radio group starts */}

              <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={(e) => setQtnsub(Number(e.target.value ))}>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="poorQuoteSubmission"
                      type="radio"
                      value="1"
                      name="quotesubmission"
                      
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="poorQuoteSubmission"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Very rarely, submits only after reminders. 😔
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="fairQuoteSubmission"
                      type="radio"
                      value="2"
                      name="quotesubmission"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="fairQuoteSubmision"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Mostly submits in time, but needs reminders
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="goodQuoteSubmission"
                      type="radio"
                      value="3"
                      name="quotesubmission"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="goodQuoteSubmission"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Always timely submits!! 😃😃😃
                    </label>
                  </div>
                </li>
                <li className="bg-zinc-900 text-white p-3"> {qtnsub}</li>
              </ul>
            </div>
          </details>

          {/* <!-- The Second FAQ --> */}
          <details className="bg-gray-300 open:bg-stone-100 duration-300 mb-9">
            <summary className="bg-inherit px-5 py-3 text-[14px] cursor-pointer">
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                Payment Terms:
              </h3>
            </summary>
            <div className="bg-white px-5 py-3 border border-gray-300 text-sm font-light">
              <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={(e) => setPayterm(Number(e.target.value ))}>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="poorPaymentTerms"
                      type="radio"
                      value="5"
                      name="paymentTerms"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="poorPaymentTerms"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Full advance, doesnt extend credit. 😔
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="fairPaymentTerms"
                      type="radio"
                      value="10"
                      name="paymentTerms"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="fairPaymentTerms"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Partial advance, L/C or other stringent credit terms extended.
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="goodPaymentTerms"
                      type="radio"
                      value="20"
                      name="paymentTerms"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="goodPaymentTerms"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Liberal credit terms! 😃😃😃
                    </label>
                  </div>
                </li>
                <li className="bg-zinc-900 text-white p-3"> {payterm}</li>
                
              </ul>
              {/* horizontal radio grpup2 ends */}
            </div>
          </details>

          {/* <!-- The Third FAQ --> */}
          <details className="bg-gray-300 open:bg-stone-100 duration-300 mb-9">
            <summary className="bg-inherit px-5 py-3 text-[14px] cursor-pointer">
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                Quality Certification: 
              </h3>
            </summary>
            <div className="bg-white px-5 py-3 border border-gray-300 text-sm font-light">
              <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={(e) => setQuality(Number(e.target.value ))}>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="poorQuality"
                      type="radio"
                      value="1"
                      name="quality"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="poorQuality"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      No ISO & No QMS 😔
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="fairQuality"
                      type="radio"
                      value="2"
                      name="quality"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="fairQuality"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Has In-house QMS but no ISO
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="goodQuality"
                      type="radio"
                      value="3"
                      name="quality"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="goodQuality"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      ISO certified in Quality! 😃😃😃
                    </label>
                  </div>
                </li>
                <li className="bg-zinc-900 text-white p-3"> {quality}</li>
              </ul>
              {/* horizontal radio grpup2 ends */}
              </div> 
              </details>

              <details className="bg-gray-300 open:bg-stone-100 duration-300 mb-9">
            <summary className="bg-inherit px-5 py-3 text-[14px] cursor-pointer">
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                Technical clarity of bids, post PO documents:
              </h3>
            </summary>
            <div className="bg-white px-5 py-3 border border-gray-300 text-sm font-light">
              <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={(e) => setClarity(Number(e.target.value ))}>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="poorClarity"
                      type="radio"
                      value="1"
                      name="clarityScope"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="poorClarity"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Doesnt submit unless reminded and followed up multiple times.😔
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="fairClarity"
                      type="radio"
                      value="2"
                      name="clarityScope"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="fairClarity"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Submits after reminders and followups
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="goodClarity"
                      type="radio"
                      value="3"
                      name="clarityScope"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="goodClarity"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Submits required documents timely! 😃😃😃
                    </label>
                  </div>
                </li>
                <li className="bg-zinc-900 text-white p-3"> {clarity}</li>
              </ul>
              {/* horizontal radio grpup2 ends */}
              </div> 
              </details>

              <details className="bg-gray-300 open:bg-stone-100 duration-300 mb-9">
            <summary className="bg-inherit px-5 py-3 text-[14px] cursor-pointer">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Salesman Interaction:
              </h3>
            </summary>
            <div className="bg-white px-5 py-3 border border-gray-300 text-sm font-light">
              <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              onChange={(e) => { setSales(Number(e.target.value) )              
              }
              }>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="horizontal-list-radio-license"
                      type="radio"
                      value="1"
                      name="salesman"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="horizontal-list-radio-license"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Very rarely visits and difficult to access online also 😔
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="horizontal-list-radio-id"
                      type="radio"
                      value="2"
                      name="salesman"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="horizontal-list-radio-id"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Visits rarely but mostly responsive over phone or mail.
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      id="goodSalesman"
                      type="radio"
                      value="3"
                      name="salesman"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      for="goodSalesman"
                      className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                    Frequently visits/always accessible! .😃😃😃
                    </label>
                  </div>
                </li>
                <li className="bg-zinc-900 text-white p-3"> {sales}</li>
              </ul>
              {/* horizontal radio grpup2 ends */}
              </div> 
              </details>
              <div className="bg-sky-800 text-gray-100 p-2 text-sm "> <span onClick={() => setTotalscore(Number(sales)+Number(quality)+Number(clarity)+Number(payterm)+Number(qtnsub))}><button type="button" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-[12px] px-3 py-1 text-center mr-2 mb-2">Finalize</button></span> <span className=" ml-72 bg-zinc-100 text-zinc-900 py-1 px-3"> Total Fixed Score: {totalscore} </span></div>
            </div>
        </div>
      
    </>
  );
}

export default Vendorevaluation;

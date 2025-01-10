import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRouter } from "next/router";

function Vendorevaluation({ vendornumber }) {
  const [qtnsub, setQtnsub] = useState();
  const [payterm, setPayterm] = useState();
  const [quality, setQuality] = useState();
  const [clarity, setClarity] = useState();
  const [sales, setSales] = useState();

  const router = useRouter();

  const [totalscore, setTotalscore] = useState(0);
  const [vendorevalfixed, setVendorevalfixed] = useState([]);
  const [vendorevaled, setVendorevaled] = useState({});
  const [vendordetails, setVendordetails] = useState({});

  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/vendors/vendordetails/${vendornumber}`);
      const json = await result.json();
      setVendordetails(json);
    })();
  }, [vendornumber]);

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/vendors/vendorevalfixed/${vendornumber}`
      );
      const json = await result.json();
      setVendorevaled(json);
    })();
  }, [vendornumber]);

  return (
    <>
      <div className="bg-zinc-100 w-full mx-3">
        <div className="mx-auto w-5/6 drop-shadow rounded-md mb-9">
          <h1 className="text-[14px] tracking-wider font-semibold text-center text-black mb-10">
            Vendor evaluation for vendor code:
            <span className="font-black text-zinc-600 bg-emerald-50/80 p-2">
              {" "}
              {vendornumber}{" "}
            </span>{" "}
            -{" "}
            <span className="p-2 bg-emerald-50/80 text-zinc-600 font-bold tracking-wide">
              Vendor name: {vendordetails["vendor-name"]}{" "}
            </span>
          </h1>

          <div className="align-center mb-3 flex justify-around bg-slate-100/80 text-zinc-800 p-3 tracking-widest shadow-lg shadow-slate-500">
            <div><p>
              <span> Country: </span>
              {vendordetails?.address?.countrycode}
            </p>
            <p className="pb-3 mb-3">{vendordetails?.address?.city}</p>
            </div>

            <div>
            <p className="text-amber-600 font-bold">
              {vendordetails?.address?.street}
            </p>
            <p className="text-amber-900 font-bold">
              <span className="text-[13px] font-lato text-stone-600"> PO Box: </span>{vendordetails?.address?.pobox}
            </p>
            <p className="text-red-900 font-bold">
              <span className="text-[13px] font-lato text-stone-600"> Zipcode: </span>{vendordetails?.address?.zipcode}
            </p>
            </div>
          </div>
          <div className="border-1 border-stone-600/60 mb-3 p-3 shadow-lg shadow-stone-400/80">
          <h4 className="w-full mx-auto font-bold italic tracking-widest">
            {" "}
            FIXED PARAMETERS:
          </h4>
       

          {/* <!-- The First FAQ --> */}
          {vendorevaled["fixedevalyear2024"] ? (
            <div className="grid grid-cols-5 gap-2">
              <h3 className=" bg-slate-100 grid-span-1 px-6 pt-16 text-slate-900 shadow-md mr-3 shadow-zinc-500">
                {" "}
                
                Evaluation result on <span className="text-[14px] font-lato text-stone-600 tracking-wide">
                  Fixed Parameters{" "} <br />
                </span> for the vendor{" "} <br /> 
                <span className="font-bold tracking-wide"> {vendornumber}</span>
              </h3>
              <div className="col-start-2 col-end-6 grid border-r-4 border-slate-600">
                
                  <div className="grid grid-cols-12 mb-10"> 
                  {" "}
                  <p className="col-span-5 text-[14px] font-semibold font-Lato ">Quotation submission Rating:{" "} </p>
                  <h4 className="col-span-1 font-bold text-[16px} shadow-md shadow-slate-400/80 mr-10 pl-3">{vendorevaled["fixedevalyear2024"]["fixedeval"][0]}{" "}</h4>
                  
                  {vendorevaled["fixedevalyear2024"]["fixedeval"][0] == 3 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-green-800"> Always submits quotation timely! </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][0] == 2 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-amber-600"> Submits quotation after reminders </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][0] == 1 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-red-800"> Very rarely submits, after reminders only. </span>
                  ) : null} 
                </div>

                <div className="grid grid-cols-12 mb-10">
                <p className="col-span-5 text-[14px] font-semibold font-Lato"> Payment terms Rating:{" "}</p>
                  <h4 className="col-span-1 font-bold text-[16px] shadow-md shadow-slate-400/80 mr-10 pl-3">{vendorevaled["fixedevalyear2024"]["fixedeval"][1]}{" "}</h4>
                  {vendorevaled["fixedevalyear2024"]["fixedeval"][1] == 20 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-green-800"> Credit terms </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][1] == 10 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-amber-600">
                      {" "}
                      Partial credit terms, but insists on some advance{" "}
                    </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][1] == 5 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-amber-600"> Full advance, no credit </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-12 mb-10">
                  {" "}
                  <p className="col-span-5 text-[14px] font-semibold font-Lato"> Quality Certification:{" "}</p>
                  <h4 className="col-span-1 font-bold text-[16px] shadow-md shadow-slate-400/80 mr-10 pl-3">{vendorevaled["fixedevalyear2024"]["fixedeval"][2]}{" "}</h4>
                  {vendorevaled["fixedevalyear2024"]["fixedeval"][2] == 3 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-green-800"> ISO certified in quality and valid currently! </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][2] == 2 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-amber-600"> Has no ISO but in-house QMS </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][2] == 1 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-red-800"> Has no ISO and no in-house QMS. </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-12 mb-10">
                  {" "}
                  <p className="col-span-5 text-[14px] font-semibold font-Lato">Technical clarity of bids and post PO documentation:{" "}</p>
                  <h4 className="col-span-1 font-bold text-[16px] shadow-md shadow-slate-400/80 mr-10 pl-3">{vendorevaled["fixedevalyear2024"]["fixedeval"][3]}{" "}</h4>
                  {vendorevaled["fixedevalyear2024"]["fixedeval"][3] == 3 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-green-800">
                      {" "}
                      Submits required documents timely and with quality!{" "}
                    </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][3] == 2 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-amber-600">
                      {" "}
                      Submits after reminders and followups and needs revisions{" "}
                    </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][3] == 1 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-red-800">
                      {" "}
                      Very bad quality documentation.{" "}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-12">
                  {" "}
                  <p className="col-span-5 text-[14px] font-semibold font-Lato">Salesman Interaction:{" "}</p>
                  <h4 className="col-span-1 font-bold text-[16px] shadow-md shadow-slate-400/80 mr-10 pl-3">{vendorevaled["fixedevalyear2024"]["fixedeval"][4]}{" "}</h4>
                  {vendorevaled["fixedevalyear2024"]["fixedeval"][4] == 3 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-green-800"> Frequently visits and always accessible! </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][4] == 2 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-amber-600">
                      {" "}
                      Visits rarely but mostly responsive over phone and mail{" "}
                    </span>
                  ) : vendorevaled["fixedevalyear2024"]["fixedeval"][4] == 1 ? (
                    <span className="col-span-6 font-Lato text-[16px] text-red-800" >
                      {" "}
                      very rarely visits and difficult to access also.{" "}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <details className="bg-gray-300 open:bg-stone-100 duration-300 mb-9">
                <summary className="bg-inherit px-5 py-1 text-[14px] cursor-pointer">
                  <h3 className="mb-1  font-semibold text-gray-900 dark:text-white">
                    Timely Quotation Submission
                  </h3>
                </summary>
                <div className="bg-white px-5 py-3 border border-gray-300 text-sm font-light">
                  {/* horizontal radio group starts */}

                  <ul
                    className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onChange={(e) => setQtnsub(Number(e.target.value))}
                  >
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
                          htmlFor="poorQuoteSubmission"
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
                          htmlFor="fairQuoteSubmision"
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
                          htmlFor="goodQuoteSubmission"
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
                  <ul
                    className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onChange={(e) => setPayterm(Number(e.target.value))}
                  >
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
                          htmlFor="poorPaymentTerms"
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
                          htmlFor="fairPaymentTerms"
                          className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Partial advance, L/C or other stringent credit terms
                          extended.
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
                          htmlFor="goodPaymentTerms"
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
                  <ul
                    className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onChange={(e) => setQuality(Number(e.target.value))}
                  >
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
                          htmlFor="poorQuality"
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
                          htmlFor="fairQuality"
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
                          htmlFor="goodQuality"
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
                  <ul
                    className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onChange={(e) => setClarity(Number(e.target.value))}
                  >
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
                          htmlFor="poorClarity"
                          className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Doesnt submit unless reminded and followed up multiple
                          times.😔
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
                          htmlFor="fairClarity"
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
                          htmlFor="goodClarity"
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
                  <ul
                    className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    onChange={(e) => {
                      setSales(Number(e.target.value));
                    }}
                  >
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
                          htmlFor="horizontal-list-radio-license"
                          className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Very rarely visits and difficult to access online also
                          😔
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
                          htmlFor="horizontal-list-radio-id"
                          className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Visits rarely but mostly responsive over phone or
                          mail.
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
                          htmlFor="goodSalesman"
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

              <div className="bg-sky-200/80 text-stone-900 p-2 text-[14px] font-bold tracking-wide uppercase ">
                {" "}
                <span
                  onClick={async () => {
                    let body;
                    setTotalscore(
                      Number(sales) +
                        Number(quality) +
                        Number(clarity) +
                        Number(payterm) +
                        Number(qtnsub)
                    );

                    // setVendorevalfixed([qtnsub, payterm, quality, clarity, sales]);
                    body = {
                      fixedeval: [qtnsub, payterm, quality, clarity, sales],
                      createdBy: session?.user?.name,
                      createdAt: new Date(),
                    };

                    await fetch(
                      `/api/vendors/vendorevalfixed/${vendornumber}`,
                      {
                        method: "PUT",
                        body: JSON.stringify(body),
                        headers: new Headers({
                          "Content-Type": "application/json",
                          Accept: "application/json",
                        }),
                      }
                    );

                    toast.success(
                      `The FIXED rating for the year 2021 for the vendor ${vendornumber} is completed, thanks!`,
                      {
                        position: toast.POSITION.TOP_RIGHT,
                      }
                    );
                    router.reload();
                  }}
                >
                  <button
                    type="button"
                    className="text-white uppercase font-bold  bg-gradient-to-r from-red-300 via-red-300 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 rounded-lg text-[12px] px-3 py-1 text-center mr-2 mb-2"
                  >
                    Finalize
                  </button>
                </span>{" "}
                <span className=" ml-[950px] bg-zinc-100 text-[12px] text-zinc-900 py-1 px-3 rounded-md">
                  {" "}
                  Total Fixed Score: {totalscore}{" "}
                </span>
              </div>
            </div>
          )}

</div>
        </div>
      </div>
    </>
  );
}

export default Vendorevaluation;

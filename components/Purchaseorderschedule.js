import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Purchaseorderschedule({ ponumber }) {
  const [poheader, setPoheader] = useState([]);

  const [editGeneraldata, setEditGeneraldata] = useState(false);
  const [gendata, setGendata] = useState({});

  // gen. PO progress data

  const [poackdate, setPOackdate] = useState(null);
  const [delysch, setDelysch] = useState("");
  const [podelydate, setPodelydate] = useState(null);
  const [estdelydate, setEstdelydate] = useState(null);
  const [basedesignrecdate, setBasedesignrecdate] = useState(null);
  const [basedesignapprdate, setBasedesignapprdate] = useState(null);
  const [basedesigncomments, setBasedesigncomments] = useState("");
  const [detdesignrecdate, setDetdesignrecdate] = useState(null);
  const [detdesignaprdate, setDetdesignaprdate] = useState(null);
  const [mfgclearancedate, setMfgclearancedate] = useState(null);
  const [itpapprdate, setItpapprdate] = useState(null);

  // payment schedule data

  const [advpaiddate, setAdvpaiddate] = useState(null);
  const [advamountpaid, setAdvamountpaid] = useState("");
  const [milestoneamountpaiddate, setMilestoneamountpaiddate] = useState(null);
  const [milestoneamountpaid, setMilestoneamountpaid] = useState("");
  const [finalpaiddate, setFinalpaiddate] = useState(null);
  const [finalcomments, setFinalpaidcomments] = useState("");
  const [finalpaidamt, setFinalpaidamt] = useState("");

  //Bank guarantee data

  const [abgestdate, setAbgestdate] = useState(null);
  const [abgactualdate, setAbgactualdate] = useState(null);
  const [abgexpirydate, setAbgexpirydate] = useState(null);
  const [abgamount, setAbgamount] = useState(0);
  const [pbgestdate, setPbgestdate] = useState(null);
  const [pbgactualdate, setPbgactualdate] = useState(null);
  const [pbgreturneddate, setPbgreturneddate] = useState(null);
  const [abgreturneddate, setAbgreturneddate] = useState(null);
  const [bgremarks, setBgremarks] = useState("");

  // L C data

  const [lcestopendate, setLcEstopendate] = useState(null);
  const [lcopeneddate, setLcOpeneddate] = useState(null);
  const [lcdatadate, setLcDatadate] = useState(null);
  const [lclastshipdate, setLcLastshipdate] = useState(null);
  const [lcexpirydate, setLcExpirydate] = useState(null);
  const [lcincoterm, setLcincoterm] = useState("");
  const [lcdocuments, setLcdocuments] = useState("");
  const [lcamount, setLcamount] = useState(0);

  // Progress Milestone data

  const [mfgstart, setMfgstart] = useState(null);
  const [Bldate, setBldate] = useState(null);
  const [Fatdate, setFatdate] = useState(null);
  const [Fatreportdate, setFatreportdate] = useState(null);
  const [vesselreacheddate, setVesselreacheddate] = useState(null);
  const [customscleareddate, setCustomscleareddate] = useState(null);

  // shipment data

  const [shipmentbookeddate, setShipmentbookeddate] = useState(null);
  const [grossweight, setGrossweight] = useState("");
  const [saberapplieddate, setSaberapplieddate] = useState(null);
  const [saberreceiveddate, setSaberreceiveddate] = useState(null);
  const [ffnoMinateddate, setFfnoMinateddate] = useState(null);
  const [finalremarks, setFinalremarks] = useState("");

  const router = useRouter();

  // fetch PO header data

  useEffect(() => {
    const fetchPurchaserorderlines = async () => {
      const response = await fetch(`/api/purchaseorders/porder/${ponumber}`);
      const json = await response.json();
      setPoheader(json);
    };
    fetchPurchaserorderlines();
  }, [ponumber]);

  // fetch all schedule data

  useEffect(() => {
    const fetchGeneraldata = async () => {
      const response = await fetch(
        `/api/purchaseorders/schedule/generaldata/${ponumber}`
      );
      const json = await response.json();
      setGendata(json);
      setDelysch(json.generaldata?.delysch || '');
      setPOackdate(json.generaldata?.poackdate || null);
      setPodelydate(json.generaldata?.podelydate || null);
      setEstdelydate(json.generaldata?.estdelydate || null);
      setBasedesignrecdate(json.generaldata?.basedesignrecdate || null);
      setBasedesignapprdate(json.generaldata?.basedesignapprdate || null);
      setBasedesigncomments(json.generaldata?.basedesigncomments || '');
      setDetdesignrecdate(json.generaldata?.detdesignrecdate || null);
      setDetdesignaprdate(json.generaldata?.detdesignaprdate || null);
      setMfgclearancedate(json.generaldata?.mfgclearancedate || null);
      setItpapprdate(json.generaldata?.itpapprdate || null);

      

      // if PO already entered in sch data, it sets 'edit' mode flag 

      const isObjectEmpty = (objectName) => {
        return JSON.stringify(objectName) === "{}";
      };
      if (!isObjectEmpty(json)) {
        setEditGeneraldata(true);
      }
    };
    fetchGeneraldata();
  }, [ponumber]);

  // console.log(gendata);

  const handleSubmitGendata = async (event) => {
    event.preventDefault();
    const data = {
      ponumber,
      poackdate,
      podelydate,
      estdelydate,
      delysch,
      basedesignrecdate,
      basedesignapprdate,
      basedesigncomments,
      detdesignrecdate,
      detdesignaprdate,
      mfgclearancedate,
      itpapprdate,
    };

    const result = await fetch(
      `/api/purchaseorders/schedule/generaldata/${ponumber}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.push({pathname:`http://localhost:3000/openpurchaseorders`})
  };

  // submit general data

  const handleEditGendata = async (e) => {
    e.preventDefault();

    const data = {
      poackdate,
      podelydate,
      estdelydate,
      delysch,
      basedesignrecdate,
      basedesignapprdate,
      basedesigncomments,
      detdesignrecdate,
      detdesignaprdate,
      mfgclearancedate,
      itpapprdate,
    };

    const result = await fetch(
      `/api/purchaseorders/schedule/generaldata/${ponumber}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("Submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.push({pathname:`http://localhost:3000/openpurchaseorders`})
  };

  // submit payment data

  

  // submit BG data

  const handleEditBgdata = async (e) => {
    e.preventDefault();

    const data = {
      abgestdate,
      abgactualdate,
      abgexpirydate,
      abgamount,
      pbgestdate,
      pbgactualdate,
      pbgreturneddate,
      abgreturneddate,
      bgremarks,
    };

    const result = await fetch(
      `/api/purchaseorders/schedule/bgdata/${ponumber}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("Submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.push({pathname:`http://localhost:3000/openpurchaseorders`})
  };


  // submit LC data

  const handleEditLcdata = async (e) => {
    e.preventDefault();

    const data = {
      lcestopendate,
      lcopeneddate,
      lcdatadate,
      lclastshipdate,
      lcexpirydate,
      lcincoterm,
      lcdocuments,
      lcamount,
    };

    const result = await fetch(
      `/api/purchaseorders/schedule/lcdata/${ponumber}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("Submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.push({pathname:`http://localhost:3000/openpurchaseorders`})
  };

  // submit progress data

  const handleEditProgressdata = async (e) => {
    e.preventDefault();

    const data = {
      mfgstart,
      Bldate,
      Fatdate,
      Fatreportdate,
      vesselreacheddate,
      customscleareddate,
    };

    const result = await fetch(
      `/api/purchaseorders/schedule/progressdata/${ponumber}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("Submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.push({pathname:`http://localhost:3000/openpurchaseorders`})
  };


  // submit shipping data

  const handleEditShipdata = async (e) => {
    e.preventDefault();

    const data = {
      shipmentbookeddate,
      grossweight,
      saberapplieddate,
      saberreceiveddate,
      ffnoMinateddate,
      finalremarks,
    };

    const result = await fetch(
      `/api/purchaseorders/schedule/shipdata/${ponumber}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("Submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    router.push({pathname:`http://localhost:3000/openpurchaseorders`})
  };




  return (
    <>
      {/* header details */}

      <div>
        {poheader.slice(0, 1).map((row, index) => (
          <div
            key={index}
            className="flex flex-row justify-evenly bg-green-500 p-3 text-white"
          >
            <p> PO Number: {row["po-number"]}</p>
            <p> PO Date: {moment(row["po-date"]).format("DD-MM-YYYY")} </p>
            <p> {row["vendorcode"]}</p>
            <p> {row["vendorname"]}</p>
          </div>
        ))}
      </div>

      {/* Delivery sch details */}
      <form
        onSubmit={!editGeneraldata ? handleSubmitGendata : handleEditGendata}
      >
        <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
          <div className="text-[14px] font-italic py-3 px-6  bg-cyan-600 text-white">
            <h3 className="justify-center align-middle">
              {" "}
              General <br /> PO Progress <br /> Data
            </h3>
          </div>

          <div className="flex-1 shadow-xl px-3 bg-cyan-100/70">
            <label
              htmlFor="poackdate"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              PO Acknowledgment date:
            </label>
            {gendata?.generaldata?.poackdate ? (
              <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold">
                {" "}
                {moment(poackdate).format("DD-MM-YYYY")}
              </div>
            ) : (
              <DatePicker
                className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={poackdate}
                onChange={(date) => setPOackdate(date)}
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [5, 10],
                    },
                  },
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      tether: false,
                      altAxis: true,
                    },
                  },
                ]}
              />
            )}

            <label
              htmlFor="podelysch"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Delivery schedule as per PO
            </label>
            {gendata?.generaldata?.delysch ? (
              <div className="py-2 px-3 w-full text-sm bg-cyan-200 text-stone-800 font-bold"> {delysch} </div>
            ) : (
              <input
                type="text"
                name="podelysch"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pb-3 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                id="podelysch"
                value={delysch}
                placeholder="e-g ....PO Delivery sch(10 working weeks from drg approval/PO/advance...)"
                onChange={(e) => setDelysch(e.target.value)}
              />
            )}

            <label
              htmlFor="podelysch"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Delivery date as per PO term.
            </label>

            {gendata?.generaldata?.podelydate ? (
              <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(podelydate).format("DD-MM-YYYY")} </div>
            ) : (
              <DatePicker
                className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={podelydate}
                onChange={(date) => setPodelydate(date)}
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [5, 10],
                    },
                  },
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      tether: false,
                      altAxis: true,
                    },
                  },
                ]}
              />
            )}

            <label
              htmlFor="estdelydate"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Estimated delivery date as per current status.
            </label>
            {gendata?.generaldata?.estdelydate ? (
              <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(estdelydate).format("DD-MM-YYYY")} </div>
            ) : (
              <DatePicker
                className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={estdelydate}
                onChange={(date) => setEstdelydate(date)}
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [5, 10],
                    },
                  },
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      tether: false,
                      altAxis: true,
                    },
                  },
                ]}
              />
            )}
          </div>

          <div className="flex-1 shadow-xl px-3 bg-cyan-100/70">
            <div className="mb-3 mx-2">
              <label
                htmlFor="basedesignrecdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Base design received date (from supplier)
              </label>

              {gendata?.generaldata?.basedesignrecdate ? (
                <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(basedesignrecdate).format("DD-MM-YYYY")} </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={basedesignrecdate}
                  onChange={(date) => setBasedesignrecdate(date)}
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [5, 10],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              )}
            </div>
            <div className="mb-3 mx-2">
              <label
                htmlFor="basedesignapprdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Base design approval date (from client/proj)
              </label>

              {gendata?.generaldata?.basedesignapprdate ? (
                <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(basedesignapprdate).format("DD-MM-YYYY")} </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={basedesignapprdate}
                  onChange={(date) => setBasedesignapprdate(date)}
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [5, 10],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              )}

              <label
                htmlFor="basedesigncomments"
                className="block mb-2  mx-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Base design comments, if any
              </label>

              {gendata?.generaldata?.basedesigncomments ? (
                <div className="py-2 px-3 w-full h-[150px] text-[12px] bg-cyan-200 text-stone-800 font-bold"> {basedesigncomments} </div>
              ) : (
                <input
                  type="text"
                  name="basedesigncomments"
                  value={basedesigncomments}
                  className="bg-gray-50  px-3  w-4/5 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  pb-24 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="basedesigncomments"
                  onChange={(e) => setBasedesigncomments(e.target.value)}
                  placeholder=" "
                />
              )}
            </div>
          </div>

          <div className="flex-1 shadow-xl px-3">
            <div className="bg-cyan-100/70 ml-3 pl-3">
              <label
                htmlFor="detdesignrecdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Detailed design received date:
              </label>

              {gendata?.generaldata?.detdesignrecdate ? (
                <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(detdesignrecdate).format("DD-MM-YYYY")} </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={detdesignrecdate}
                  onChange={(date) => setDetdesignrecdate(date)}
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [5, 10],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              )}

              <label
                htmlFor="detdesignapprodate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Detailed Design approval date:
              </label>

              {gendata?.generaldata?.detdesignaprdate ? (
                <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(detdesignaprdate).format("DD-MM-YYYY")} </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={detdesignaprdate}
                  onChange={(date) => setDetdesignaprdate(date)}
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [5, 10],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              )}

              <label
                htmlFor="mfgclearancedate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Manufacturing clearance issued date:
              </label>
              {gendata?.generaldata?.mfgclearancedate ? (
                <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(mfgclearancedate).format("DD-MM-YYYY")} </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={mfgclearancedate}
                  onChange={(date) => setMfgclearancedate(date)}
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [5, 10],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              )}

              <label
                htmlFor="itpapprdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                ITP Approval date
              </label>
              {gendata?.generaldata?.itpapprdate ? (
                <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold"> {moment(itpapprdate).format("DD-MM-YYYY")} </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={itpapprdate}
                  onChange={(date) => setItpapprdate(date)}
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [5, 10],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        tether: false,
                        altAxis: true,
                      },
                    },
                  ]}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="absolute p-3 rounded-lg bg-sky-800/10 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/2"
          >
            {" "}
            {!editGeneraldata ? "Save" : "Edit"}{" "}
          </button>
        </div>
      </form>

      {/* payment sch details */}

      {/* <form
        onSubmit={!editGeneraldata ? null : null}
      >

      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
        <div className="text-[14px] font-italic py-3 px-6  bg-green-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Payment <br /> Schedule <br /> Data
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3 bg-green-100/70">
          <label
            htmlFor="advpaiddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Advance Paid date
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            // selected={advpaiddate}
            onChange={(date) => setAdvpaiddate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="advamountpaid"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Advance Amount paid
          </label>
          <input
            type="text"
            name="advamountpaid"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="advamountpaid"
            // pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
            value={advamountpaid}
            // data-type="currency"
            onChange={(e) => setAdvamountpaid(e.target.value)}
            placeholder="e-g ..SAR10,000.00"
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-green-100/70">
          <label
            htmlFor="milestoneamountpaiddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Milestone amount paid Date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            // selected={milestoneamountpaiddate}
            onChange={(date) => setMilestoneamountpaiddate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="milestoneamtpaid"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Milestone amount paid
          </label>
          <input
            type="text"
            name="milestoneamtpaid"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="milestoneamountpaid"
            // pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
            value={milestoneamountpaid}
            onChange={(e) => setMilestoneamountpaid(e.target.value)}
            // data-type="currency"
            placeholder="e.g ...SAR100,000.00"
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-green-100/70">
          <label
            htmlFor="finalpaiddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Final payment done on:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            // selected={finalpaiddate}
            onChange={(date) => setFinalpaiddate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="finalpaidamt"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Final payment amount
          </label>
          <input
            type="text"
            name="finalpaidamt"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="abgamount"
            // pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
            value={finalpaidamt}
            onChange={(e) => setFinalpaidamt(e.target.value)}
            // data-type="currency"
            placeholder="e.g ...SAR200,000.00"
          />

          <label
            htmlFor="finalcomments"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Remarks if any (deduction etc.)
          </label>

          <input
            type="text"
            name="finalcomments"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pb-24 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="finalcomments"
            value={finalcomments}
            onChange={(e) => setFinalpaidcomments(e.target.value)}
            placeholder="e.g...2560SAR deducted for damaged fitting.."
          />
        </div>
        <button 
        type="submit"
        className="absolute p-3 rounded-lg bg-green-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/3">
          {" "}
          {!editGeneraldata ? "Save" : "Edit"}{" "}
        </button>
      </div>
      </form> */}

      {/* BG details */}

      <form
        onSubmit={!editGeneraldata ? null : handleEditBgdata}
      >
      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
        <div className="text-[14px] font-italic py-3 px-6  bg-sky-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Adv/Performance <br /> Bank <br /> Guarantee <br /> Data{" "}
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3 bg-sky-100/70">
          <div className="px-3">
            <label
              htmlFor="lcincoterm"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Advance BG Date estimated as per PO term.
            </label>
            <DatePicker
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              selected={abgestdate}
              onChange={(date) => setAbgestdate(date)}
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [5, 10],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    rootBoundary: "viewport",
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
            />

            <label
              htmlFor="abgamount"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Enter Advance BG amount
            </label>
            <input
              type="text"
              name="lcamountfield"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-1  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              id="abgamount"
              pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
              value=""
              data-type="currency"
              placeholder="e.g ..SAR500,000.00"
            />
          </div>
          <div className="bg-sky-100/70 px-3">
            <label
              htmlFor="lcincoterm"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Advance BG Date of fresh/extended start:
            </label>
            <DatePicker
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              selected={abgestdate}
              onChange={(date) => setAbgestdate(date)}
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [5, 10],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    rootBoundary: "viewport",
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
            />

            <label
              htmlFor="lcincoterm"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Advance BG Date of expiry
            </label>
            <DatePicker
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              selected={abgestdate}
              onChange={(date) => setAbgestdate(date)}
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [5, 10],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    rootBoundary: "viewport",
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
            />
          </div>
        </div>

        {/* performance bank guarantee related data */}

        <div className="flex-1 shadow-xl px-3 bg-sky-100/70 ">
          <div className="px-3">
            <label
              for="lcincoterm"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Performance BG Date estimated as per PO term.
            </label>
            <DatePicker
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              selected={abgestdate}
              onChange={(date) => setAbgestdate(date)}
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [5, 10],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    rootBoundary: "viewport",
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
            />

            <label
              htmlFor="abgamount"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Enter Performance BG amount
            </label>
            <input
              type="text"
              name="lcamountfield"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              id="abgamount"
              pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
              value=""
              data-type="currency"
              placeholder="e.g ...SAR500,000.00"
            />
          </div>

          <div className="bg-sky-100/70 px-3">
            <label
              htmlFor="lcincoterm"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Performance BG Date fresh/extended start:
            </label>
            <DatePicker
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              selected={abgestdate}
              onChange={(date) => setAbgestdate(date)}
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [5, 10],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    rootBoundary: "viewport",
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
            />

            <label
              htmlFor="lcincoterm"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Performance BG Expiry date:
            </label>
            <DatePicker
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              selected={abgestdate}
              onChange={(date) => setAbgestdate(date)}
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [5, 10],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    rootBoundary: "viewport",
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
            />
          </div>
        </div>
        <div className="flex-1 shadow-xl px-3 bg-sky-100/70">
          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            ABG returned/extinguished date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={abgreturneddate}
            onChange={(date) => setAbgreturneddate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />

          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            PBG returned/extinguished date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={pbgreturneddate}
            onChange={(date) => setPbgreturneddate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />

          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Remarks on BG's:
          </label>
          <input
            type="text"
            name="remarksbgfield"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pb-20 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="remarksbg"
            placeholder="e.g....bank name which issued BG/ any free text comment by MM/finance"
          />
        </div>
        <button className="absolute p-3 rounded-lg bg-blue-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/3">
          {" "}
          Update{" "}
        </button>

        {/* Bonds / guarantees released back to supplier */}
      </div>
      </form>

      {/* L/C details */}

      <form
        onSubmit={!editGeneraldata ? null : handleEditLcdata}
      >
      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-44 pb-28 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
        <div className="text-[14px] font-italic py-3 px-6  bg-purple-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Letter of Credit
            <br /> Data{" "}
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC Open date estimated:{" "}
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={lcestopendate}
            onChange={(date) => setLcEstopendate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />

          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            L C Incoterm:{" "}
          </label>
          <input
            type="text"
            id="first_name"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="CIF/DDP/Ex-w..."
            required
          />

          <label
            htmlFor="currency-field"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Enter L/C Amount
          </label>
          <input
            type="text"
            name="lcamountfield"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            id="lcamount"
            pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
            value=""
            data-type="currency"
            placeholder="SAR500,000.00"
          />
        </div>
        <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
          <label
            htmlFor="lcdocs"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC Documents:{" "}
          </label>
          <input
            type="text"
            id="lcdocs"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4  p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Original Invoice/Bill of Lading/..."
            required
          />

          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC data requested & received from supplier:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={lcdatadate}
            onChange={(date) => setLcDatadate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />

          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC opened date: (swift advice from bank)
          </label>
          <DatePicker
            className="bg-gray-50 border  border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={lcopeneddate}
            popperPlacement="top-start"
            DayPickerInput-Overlay
            onChange={(date) => setLcOpeneddate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
          <label
            htmlFor="lcswift"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC Swift Number & Bank:
          </label>
          <input
            type="text"
            id="lcswift"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Original Invoice/Bill of Lading/..."
            required
          />

          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC Last shipment date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={lclastshipdate}
            popperPlacement="top-start"
            onChange={(date) => setLcLastshipdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />

          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC Expiry Date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={lcexpirydate}
            popperPlacement="top-start"
            onChange={(date) => setLcExpirydate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
          <label
            htmlFor="lcincoterm"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            LC Remarks
          </label>

          <input
            type="textarea"
            id="lcremarks"
            className="bg-gray-50 border border-gray-300 pb-64 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-1/2 p-2.5  mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Any free text remarks by JAL Fin / Proj/ MMD/..."
            required
          />
        </div>
        <button className="absolute p-3 rounded-lg bg-purple-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-2/3">
          {" "}
          Update{" "}
        </button>
      </div>

      </form>

      {/* progress milestones */}

      <form
        onSubmit={!editGeneraldata ? null : handleEditProgressdata}
      >

      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
        <div className="text-[14px] font-italic py-3 px-6  bg-fuchsia-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Progress <br /> Milestones
            <br /> Data
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3 bg-fuchsia-100/70">
          <label
            htmlFor="mfgstart"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Actual Manufacturing start Date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={mfgstart}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="Fatdate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            FAT/Final inspection date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={Fatdate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-fuchsia-100/70">
          <label
            htmlFor="Fatreportdate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            TPI /Final inspection report received date:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={Fatreportdate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="Bldate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            B/L/ AWB booked date
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={Bldate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-fuchsia-100/70">
          <label
            htmlFor="vesselreacheddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Flight/vessel reached date
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={vesselreacheddate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="customscleareddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Customs cleared/ Bayyan paid date
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={customscleareddate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
        </div>
        <button className="absolute p-3 rounded-lg bg-fuchsia-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/2">
          {" "}
          Update{" "}
        </button>
      </div>
      </form>

     

      {/* Packing & Shipment details */}

      <form
        onSubmit={!editGeneraldata ? null : handleEditShipdata}
      >


      <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
        <div className="text-[14px] font-italic py-3 px-6  bg-amber-600 text-white">
          <h3 className="justify-center align-middle">
            {" "}
            Packing & <br /> Shipment <br /> Related <br /> Data (for Ex-works
            only)
          </h3>
        </div>

        <div className="flex-1 shadow-xl px-3 bg-amber-100/70">
          <label
            htmlFor="dimensions"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Gross weight/dimensions (appx) in KG/Metric dimensions
          </label>
          <input
            type="text"
            id="dimensions"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Gross weight (Kg) and dimensions (Metric)/..."
            required
          />

          <label
            htmlFor="shipmentbookedddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Shipment is booked on:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={shipmentbookeddate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-amber-100/70">
          <label
            htmlFor="saberapplieddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            SABER applied on:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={saberapplieddate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="saberreceiveddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            SABER received on:
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={saberreceiveddate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
        </div>

        <div className="flex-1 shadow-xl px-3 bg-amber-100/70">
          <label
            htmlFor="ffnominateddate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Freight forwarder nominated on
          </label>
          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            selected={ffnoMinateddate}
            onChange={(date) => setAbgestdate(date)}
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [5, 10],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <label
            htmlFor="finalremarks"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            FINAL REMARKS ON PO:
          </label>
          <input
            type="text"
            id="finalremarks"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pb-28 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="FINAL REMARKS IF ANY..."
            required
          />
        </div>
        <button className="absolute p-3 rounded-lg bg-amber-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/2">
          {" "}
          Update{" "}
        </button>
      </div>

      </form>

      <section class="container px-4 w-full mx-auto">
        <div class="flex flex-col">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div class="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-200 dark:bg-gray-800">
                    <tr className="font-bold text-[12px] ">
                      <th
                        scope="col"
                        class="px-4 py-3.5 text-left rtl:text-right text-gray-800 dark:text-gray-400"
                      >
                        Material code/group
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5 text-left rtl:text-right text-gray-800 dark:text-gray-400"
                      >
                        Material description
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5 text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Unit rate/currency
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5 text-left rtl:text-right text-gray-800 dark:text-gray-400"
                      >
                        Item value
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending qty
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending Value
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending Inv Quantity
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3.5 text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending Inv value
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                    {poheader.map((row, index) => (
                      <tr key={index}>
                        <td class="px-4 py-4 text-[12px] font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row.material["matcode"]}/{row.material["matgroup"]}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row.material["matdescription"]}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-light text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-quantity"].$numberDecimal}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-unit-of-measure"]}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-unit-price"].toLocaleString()}/{row.currency}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-medium text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-value-sar"].toLocaleString("en-US", {
                            style: "currency",
                            currency: "SAR",
                          })}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["pending-qty"].$numberDecimal}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-light text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["pending-val-sar"].toLocaleString("en-US", {
                            style: "currency",
                            currency: "SAR",
                          })}
                        </td>
                        <td class="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["pending-inv-qty"].$numberDecimal}
                        </td>
                        <td class="px-4 py-4 text-[12px] text-right font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["pending-inv-val"].toLocaleString("en-US", {
                            style: "currency",
                            currency: "SAR",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Purchaseorderschedule;

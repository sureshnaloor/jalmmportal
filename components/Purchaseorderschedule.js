import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "next-themes";
import { useSession,  } from "next-auth/react";

// Define styles outside the component
const savedFieldStyle = "py-2 px-3 w-1/3 bg-sky-100 border border-sky-200 rounded-md text-gray-700 font-medium cursor-not-allowed select-none shadow-inner";
const savedFieldStyleWide = "py-2 px-3 w-full bg-sky-100 border border-sky-200 rounded-md text-gray-700 font-medium cursor-not-allowed select-none shadow-inner";

function Purchaseorderschedule({ ponumber }) {
  const { data: session } = useSession();

  const [poheader, setPoheader] = useState([]);
  const [gendata, setGendata] = useState({});

  // for applicable tag flags
  const [bgtab, setBgtab] = useState(null);
  const [lctab, setLctab] = useState(null);
  const [testing, setTesting] = useState(null);
  const [shipping, setShipping] = useState(null);

  const [bgflagged, setBgflagged] = useState(false);
  const [lcflagged, setLcflagged] = useState(false);
  const [testflagged, setTestflagged] = useState(false);
  const [shipflagged, setShipflagged] = useState(false);

  // gen. PO progress data

  const [poackdate, setPOackdate] = useState(null);
  const [delysch, setDelysch] = useState("");
  const [podelydate, setPodelydate] = useState(null);
  const [estdelydate, setEstdelydate] = useState(null);
  const [basedesignrecdate, setBasedesignrecdate] = useState(null);
  const [basedesignapprdate, setBasedesignapprdate] = useState(null);
  const [basedesigncomments, setBasedesigncomments] = useState("");
  const [generalcomments, setGeneralcomments] = useState("");
  const [detdesignrecdate, setDetdesignrecdate] = useState(null);
  const [detdesignaprdate, setDetdesignaprdate] = useState(null);
  const [mfgclearancedate, setMfgclearancedate] = useState(null);
  const [itpapprdate, setItpapprdate] = useState(null);
  // const [workmilestonecompleted, setWorkmilestonecompleted] = useState(["test"])
  // const [workmilestonecompleteddate, setWorkmilestonecompleteddate] = useState([])
  const [finalworkcompleteddate, setFinalworkcompleteddate] = useState(null);
  const [grdate, setGrdate] = useState(null);

  // payment schedule data

  const [advpaiddate, setAdvpaiddate] = useState(null);
  const [advamountpaid, setAdvamountpaid] = useState("");
  const [milestoneamountpaiddate, setMilestoneamountpaiddate] = useState(null);
  const [milestoneamountpaid, setMilestoneamountpaid] = useState("");
  const [finalpaiddate, setFinalpaiddate] = useState(null);
  const [finalpaidamt, setFinalpaidamt] = useState("");
  const [finalcomments, setFinalpaidcomments] = useState("");

  //Bank guarantee data

  const [abgestdate, setAbgestdate] = useState(null);
  const [abgactualdate, setAbgactualdate] = useState(null);
  const [abgexpirydate, setAbgexpirydate] = useState(null);
  const [abgamount, setAbgamount] = useState(0);
  const [pbgestdate, setPbgestdate] = useState(null);
  const [pbgactualdate, setPbgactualdate] = useState(null);
  const [pbgreturneddate, setPbgreturneddate] = useState(null);
  const [abgreturneddate, setAbgreturneddate] = useState(null);
  const [pbgamount, setPbgamount] = useState(0);
  const [bgremarks, setBgremarks] = useState("");
  const [pbgexpirydate, setPbgexpirydate] = useState(null);

  // L C data

  const [lcestopendate, setLcEstopendate] = useState(null);
  const [lcopeneddate, setLcOpeneddate] = useState(null);
  const [lcdatadate, setLcDatadate] = useState(null);
  const [lclastshipdate, setLcLastshipdate] = useState(null);
  const [lcexpirydate, setLcExpirydate] = useState(null);
  const [lcincoterm, setLcincoterm] = useState("");
  const [lcdocuments, setLcdocuments] = useState("");
  const [lcamount, setLcamount] = useState(0);
  const [lcremarks, setLcremarks] = useState("");
  const [lcswift, setLcswift] = useState("");

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

  // Add editGeneralData state (note the capital D)
  const [editGeneralData, setEditGeneralData] = useState(false);

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
      setDelysch(json.generaldata?.delysch || "");
      setPOackdate(json.generaldata?.poackdate || null);
      setPodelydate(json.generaldata?.podelydate || null);
      setEstdelydate(json.generaldata?.estdelydate || null);
      setBasedesignrecdate(json.generaldata?.basedesignrecdate || null);
      setBasedesignapprdate(json.generaldata?.basedesignapprdate || null);
      setBasedesigncomments(json.generaldata?.basedesigncomments || "");
      setGeneralcomments(json.generaldata?.generalcomments || "");
      setDetdesignrecdate(json.generaldata?.detdesignrecdate || null);
      setDetdesignaprdate(json.generaldata?.detdesignaprdate || null);
      setMfgclearancedate(json.generaldata?.mfgclearancedate || null);
      setItpapprdate(json.generaldata?.itpapprdate || null);
      // setWorkmilestonecompleted(json.generaldata?.workmilestonecompleted || null)
      // setWorkmilestonecompleteddate(json.generaldata?.workmilestonecompleteddate || null)
      setFinalworkcompleteddate(
        json.generaldata?.finalworkcompleteddate || null
      );
      setGrdate(json.generaldata?.grdate || null);

      setAdvpaiddate(json.paymentdata?.advpaiddate || null);
      setAdvamountpaid(json.paymentdata?.advamountpaid || "");
      setMilestoneamountpaiddate(
        json.paymentdata?.milestoneamountpaiddate || null
      );
      setMilestoneamountpaid(json.paymentdata?.milestoneamountpaid || 0);
      setFinalpaiddate(json.paymentdata?.finalpaiddate || null);
      setFinalpaidamt(json.paymentdata?.finalpaidamt || null);
      setFinalpaidcomments(json.paymentdata?.finalcomments || "");

      setAbgestdate(json.bgdata?.abgestdate || null);
      setAbgactualdate(json.bgdata?.abgactualdate || null);
      setAbgamount(json.bgdata?.abgamount || 0);
      setAbgexpirydate(json.bgdata?.abgexpirydate || null);
      setAbgreturneddate(json.bgdata?.abgreturneddate || null);
      setPbgactualdate(json.bgdata?.pbgactualdate || null);
      setPbgestdate(json.bgdata?.pbgestdate || null);
      setPbgreturneddate(json.bgdata?.pbgreturneddate || null);
      setPbgexpirydate(json.bgdata?.pbgexpirydate || null);
      setPbgamount(json.bgdata?.pbgamount || null);
      setBgremarks(json.bgdata?.bgremarks || "");

      setLcDatadate(json.lcdata?.lcdatadate || null);
      setLcEstopendate(json.lcdata?.lcestopendate || null);
      setLcExpirydate(json.lcdata?.lcexpirydate);
      setLcincoterm(json.lcdata?.lcincoterm || "");
      setLcamount(json.lcdata?.lcamount || "");
      setLcOpeneddate(json.lcdata?.lcopeneddate || null);
      setLcdocuments(json.lcdata?.lcdocuments || "");
      setLcLastshipdate(json.lcdata?.lclastshipdate || null);
      setLcswift(json.lcdata?.lcswift || "");
      setLcremarks(json.lcdata?.lcremarks || "");

      setMfgstart(json.progressdata?.mfgstart || null);
      setFatdate(json.progressdata?.Fatdate || null);
      setFatreportdate(json.progressdata?.Fatreportdate || null);
      setBldate(json.progressdata?.Bldate || null);
      setVesselreacheddate(json.progressdata?.vesselreacheddate || null);
      setCustomscleareddate(json.progressdata?.customscleareddate || null);

      setShipmentbookeddate(json.shipdata?.shipmentbookeddate || null);
      setGrossweight(json.shipdata?.grossweight || "");
      setSaberapplieddate(json.shipdata?.saberapplieddate || null);
      setSaberreceiveddate(json.shipdata?.saberreceiveddate || null);
      setFinalremarks(json.shipdata?.finalremarks || "");
      setFfnoMinateddate(json.shipdata?.ffnoMinateddate || null);

      //set the tab flags
      if (json.bgtab) {
        setBgflagged(true);
        setBgtab("not applicable")
      }

      if (json.lctab) {
        setLcflagged(true);
        setLctab("not applicable")
      }

      if (json.testing) {
        setTestflagged(true);
        setTesting("not applicable")
      }

      if (json.shipping) {
        setShipflagged(true);
        setTesting("not applicable")
      }

      // if PO already entered in sch data, it sets 'edit' mode flag

      const isObjectEmpty = (objectName) => {
        return JSON.stringify(objectName) === "{}";
      };
      if (!isObjectEmpty(json)) {
        setEditGeneralData(true);
      }
    };
    fetchGeneraldata();
  }, [ponumber]);

  // console.log(gendata);

  const [activeBlock, setActiveBlock] = useState(null);

  const updateBlockData = (blockName, newData) => {
    switch (blockName) {
      case "generalData":
        setGendata(prevState => ({
          ...prevState,
          generaldata: { ...prevState.generaldata, ...newData }
        }));
        break;
      case "paymentData":
        setGendata(prevState => ({
          ...prevState,
          paymentdata: { ...prevState.paymentdata, ...newData }
        }));
        break;
      // Add cases for other blocks as needed
    }
  };

  const handleSubmitGendata = async (event) => {
    event.preventDefault();
    setActiveBlock("generalData");
    const data = {
      ponumber,
      poackdate,
      podelydate,
      estdelydate,
      delysch,
      basedesignrecdate,
      basedesignapprdate,
      basedesigncomments,
      generalcomments,
      detdesignrecdate,
      detdesignaprdate,
      mfgclearancedate,
      itpapprdate,
      finalworkcompleteddate,
      grdate,
      advpaiddate,
      advamountpaid,
      milestoneamountpaid,
      milestoneamountpaiddate,
      finalpaiddate,
      finalpaidamt,
      finalcomments,
      abgestdate,
      abgactualdate,
      abgamount,
      abgexpirydate,
      abgreturneddate,
      pbgactualdate,
      pbgestdate,
      pbgreturneddate,
      pbgexpirydate,
      pbgamount,
      bgremarks,
      lcdatadate,
      lcestopendate,
      lcopeneddate,
      lclastshipdate,
      lcexpirydate,
      lcincoterm,
      lcdocuments,
      lcremarks,
      lcamount,
      lcswift,
      mfgstart,
      Bldate,
      Fatdate,
      Fatreportdate,
      vesselreacheddate,
      customscleareddate,
      shipmentbookeddate,
      grossweight,
      saberapplieddate,
      saberreceiveddate,
      ffnoMinateddate,
      finalremarks,
      bgtab,
      lctab,
      shipping,
      testing,
    };

    try {
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

      const updatedData = await result.json();
      updateBlockData("generalData", updatedData.generaldata);
      toast.success("Submitted successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error submitting data. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } finally {
      setActiveBlock(null);
    }
  };

  const handleEditGendata = async (e) => {
    e.preventDefault();
    setActiveBlock("generalData");
    const data = {
      poackdate,
      podelydate,
      estdelydate,
      delysch,
      basedesignrecdate,
      basedesignapprdate,
      basedesigncomments,
      generalcomments,
      detdesignrecdate,
      detdesignaprdate,
      mfgclearancedate,
      itpapprdate,
      finalworkcompleteddate,
      grdate,
      advamountpaid,
      advpaiddate,
      milestoneamountpaid,
      milestoneamountpaiddate,
      finalpaiddate,
      finalpaidamt,
      finalcomments,
      abgestdate,
      abgactualdate,
      abgamount,
      abgexpirydate,
      abgreturneddate,
      pbgactualdate,
      pbgestdate,
      pbgreturneddate,
      pbgexpirydate,
      pbgamount,
      bgremarks,
      lcdatadate,
      lcestopendate,
      lcopeneddate,
      lclastshipdate,
      lcexpirydate,
      lcincoterm,
      lcdocuments,
      lcamount,
      lcswift,
      lcremarks,
      mfgstart,
      Bldate,
      Fatdate,
      Fatreportdate,
      vesselreacheddate,
      customscleareddate,
      shipmentbookeddate,
      grossweight,
      saberapplieddate,
      saberreceiveddate,
      ffnoMinateddate,
      finalremarks,
      bgtab,
      lctab,
      testing,
      shipping,
    };

    try {
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

      const updatedData = await result.json();
      updateBlockData("generalData", updatedData.generaldata);
      toast.success("Updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Error updating data. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } finally {
      setActiveBlock(null);
    }
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
        onSubmit={!editGeneralData ? handleSubmitGendata : handleEditGendata}
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
              <div className={savedFieldStyle}>
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
              <div className={savedFieldStyleWide}>
                {delysch}
              </div>
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
              <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold">
                {" "}
                {moment(podelydate).format("DD-MM-YYYY")}{" "}
              </div>
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
            {gendata?.generaldata?.estdelydate ?  (
              // <div className="py-2 px-3 w-1/3 bg-cyan-200 text-stone-800 font-bold">
              //   {" "}
              //   {moment(estdelydate).format("DD-MM-YYYY")}{" "}
              // </div>
              <DatePicker
                className="bg-sky-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={new Date(estdelydate)}
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
           
            ) : (
              <DatePicker
                className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={new Date(estdelydate)}
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
                <div className={savedFieldStyle}>
                  {moment(basedesignrecdate).format("DD-MM-YYYY")}
                </div>
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
                <div className={savedFieldStyle}>
                  {moment(basedesignapprdate).format("DD-MM-YYYY")}
                </div>
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
                <div className={savedFieldStyleWide}>
                  {basedesigncomments}
                </div>
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

              {/* New General comments textbox */}
              <label
                htmlFor="generalcomments"
                className="block mb-2  mx-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                General comments
              </label>

              {gendata?.generaldata?.generalcomments ? (
                <div className={savedFieldStyleWide}>
                  {generalcomments}
                </div>
              ) : (
                <input
                  type="text"
                  name="generalcomments"
                  value={generalcomments}
                  className="bg-gray-50  px-3  w-4/5 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  pb-24 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="generalcomments"
                  onChange={(e) => setGeneralcomments(e.target.value)}
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
                <div className={savedFieldStyle}>
                  {moment(detdesignrecdate).format("DD-MM-YYYY")}
                </div>
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
                <div className={savedFieldStyle}>
                  {moment(detdesignaprdate).format("DD-MM-YYYY")}
                </div>
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
                <div className={savedFieldStyle}>
                  {moment(mfgclearancedate).format("DD-MM-YYYY")}
                </div>
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
                <div className={savedFieldStyle}>
                  {moment(itpapprdate).format("DD-MM-YYYY")}
                </div>
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

              <label
                htmlFor="finalworkcompleteddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Final work completed date
              </label>
              {gendata?.generaldata?.finalworkcompleteddate ? (
                <div className={savedFieldStyle}>
                  {moment(finalworkcompleteddate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={finalworkcompleteddate}
                  onChange={(date) => setFinalworkcompleteddate(date)}
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
                htmlFor="Grdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                GR/SES posted date
              </label>
              {gendata?.generaldata?.grdate ? (
                <div className={savedFieldStyle}>
                  {moment(grdate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/4 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={grdate}
                  onChange={(date) => setGrdate(date)}
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
            onClick={!editGeneralData ? handleSubmitGendata : handleEditGendata}
            className="absolute p-3 rounded-lg bg-sky-800/10 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/3"
            disabled={activeBlock === "generalData"}
          >
            {activeBlock === "generalData" ? "Saving..." : (!editGeneralData ? "Save" : "Edit")}
          </button>
        </div>

        {/* payment sch details */}

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
            {gendata?.paymentdata?.advpaiddate ? (
              <div className={savedFieldStyle}>
                {moment(advpaiddate).format("DD-MM-YYYY")}
              </div>
            ) : (
              <DatePicker
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={advpaiddate}
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
            )}

            <label
              htmlFor="advamountpaid"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Advance Amount paid
            </label>
            {gendata?.paymentdata?.advamountpaid ? (
              <div className={savedFieldStyle}>
                {advamountpaid}
              </div>
            ) : (
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
            )}
          </div>

          <div className="flex-1 shadow-xl px-3 bg-green-100/70">
            <label
              htmlFor="milestoneamountpaiddate"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Milestone amount paid Date:
            </label>

            {gendata?.paymentdata?.milestoneamountpaiddate ? (
              <div className={savedFieldStyle}>
                {moment(milestoneamountpaiddate).format("DD-MM-YYYY")}
              </div>
            ) : (
              <DatePicker
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={milestoneamountpaiddate}
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
            )}

            <label
              htmlFor="milestoneamtpaid"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Milestone amount paid
            </label>

            {gendata?.paymentdata?.milestoneamountpaid ? (
              <div className={savedFieldStyle}>
                {milestoneamountpaid}
              </div>
            ) : (
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
            )}
          </div>

          <div className="flex-1 shadow-xl px-3 bg-green-100/70">
            <label
              htmlFor="finalpaiddate"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Final payment done on:
            </label>

            {gendata?.paymentdata?.finalpaiddate ? (
              <div className={savedFieldStyle}>
                {moment(finalpaiddate).format("DD-MM-YYYY")}
              </div>
            ) : (
              <DatePicker
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                selected={finalpaiddate}
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
            )}

            <label
              htmlFor="finalpaidamt"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Final payment amount
            </label>

            {gendata?.paymentdata?.finalpaidamt ? (
              <div className={savedFieldStyle}>
                {finalpaidamt}
              </div>
            ) : (
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
            )}

            <label
              htmlFor="finalcomments"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Remarks if any (deduction etc.)
            </label>

            {gendata?.paymentdata?.finalcomments ? (
              <div className={savedFieldStyle}>
                {finalcomments}
              </div>
            ) : (
              <input
                type="text"
                name="finalcomments"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pb-24 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                id="finalcomments"
                value={finalcomments}
                onChange={(e) => setFinalpaidcomments(e.target.value)}
                placeholder="e.g...2560SAR deducted for damaged fitting.."
              />
            )}
          </div>
          <button
            type="submit"
            className="absolute p-3 rounded-lg bg-green-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/3"
          >
            {" "}
            {!editGeneralData ? "Save" : "Edit"}{" "}
          </button>
        </div>

        {/* BG details */}

        {bgflagged ? null : (
          <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
            <div className="text-[14px] font-italic py-3 px-6  bg-sky-600 text-white">
              <h3 className="justify-center align-middle">
                {" "}
                Adv/Performance <br /> Bank <br /> Guarantee <br /> Data{" "}
              </h3>
              <br />
              <div className="flex items-center">
                <input
                  id="bgtabchk"
                  type="checkbox"
                  onChange={(e) => setBgtab(e.target.value)}
                  value="not applicable"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="bgtabchk"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Not Applicable
                </label>
              </div>
            </div>

            <div className="flex-1 shadow-xl px-3 bg-sky-100/70">
              <div className="px-3">
                <label
                  htmlFor="abgestdate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Advance BG Date estimated as per PO term.
                </label>

                {gendata?.bgdata?.abgestdate ? (
                  <div className={savedFieldStyle}>
                    {moment(abgestdate).format("DD-MM-YYYY")}
                  </div>
                ) : (
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
                )}

                <label
                  htmlFor="abgamount"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Enter Advance BG amount
                </label>

                {gendata?.bgdata?.abgamount ? (
                  <div className={savedFieldStyle}>
                    {abgamount}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="abgamount"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-1  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    id="abgamount"
                    // pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
                    value={abgamount}
                    onChange={(e) => setAbgamount(e.target.value)}
                    // data-type="currency"
                    placeholder="e.g ..SAR500,000.00"
                  />
                )}
              </div>
              <div className="bg-sky-100/70 px-3">
                <label
                  htmlFor="abgactualdate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Advance BG Date of fresh/extended start:
                </label>

                {gendata?.bgdata?.abgactualdate ? (
                  <div className={savedFieldStyle}>
                    {moment(abgactualdate).format("DD-MM-YYYY")}
                  </div>
                ) : (
                  <DatePicker
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    selected={abgactualdate}
                    onChange={(date) => setAbgactualdate(date)}
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
                  htmlFor="abgexpirydate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Advance BG Date of expiry
                </label>

                {gendata?.bgdata?.abgexpirydate ? (
                  <div className={savedFieldStyle}>
                    {moment(abgexpirydate).format("DD-MM-YYYY")}
                  </div>
                ) : (
                  <DatePicker
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    selected={abgexpirydate}
                    onChange={(date) => setAbgexpirydate(date)}
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

            {/* performance bank guarantee related data */}

            <div className="flex-1 shadow-xl px-3 bg-sky-100/70 ">
              <div className="px-3">
                <label
                  htmlFor="pbgestdate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Performance BG Date estimated as per PO term.
                </label>

                {gendata?.bgdata?.pbgestdate ? (
                  <div className={savedFieldStyle}>
                    {moment(pbgestdate).format("DD-MM-YYYY")}
                  </div>
                ) : (
                  <DatePicker
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    selected={pbgestdate}
                    onChange={(date) => setPbgestdate(date)}
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
                  htmlFor="pbgamount"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Enter Performance BG amount
                </label>

                {gendata?.bgdata?.pbgamount ? (
                  <div className={savedFieldStyle}>
                    {pbgamount}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="pbgamount"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    id="pbgamount"
                    // pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
                    value={pbgamount}
                    onChange={(e) => setPbgamount(e.target.value)}
                    // data-type="currency"
                    placeholder="e.g ...SAR500,000.00"
                  />
                )}
              </div>

              <div className="bg-sky-100/70 px-3">
                <label
                  htmlFor="pbgactualdate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Performance BG Date fresh/extended start:
                </label>

                {gendata?.bgdata?.pbgactualdate ? (
                  <div className={savedFieldStyle}>
                    {moment(pbgactualdate).format("DD-MM-YYYY")}
                  </div>
                ) : (
                  <DatePicker
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    selected={pbgactualdate}
                    onChange={(date) => setPbgactualdate(date)}
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
                  htmlFor="pbgexpirydate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Performance BG Expiry date:
                </label>

                {gendata?.bgdata?.pbgexpirydate ? (
                  <div className={savedFieldStyle}>
                    {moment(pbgexpirydate).format("DD-MM-YYYY")}
                  </div>
                ) : (
                  <DatePicker
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    selected={pbgexpirydate}
                    onChange={(date) => setPbgexpirydate(date)}
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
            <div className="flex-1 shadow-xl px-3 bg-sky-100/70">
              <label
                htmlFor="abgreturned"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                ABG returned/extinguished date:
              </label>

              {gendata?.bgdata?.abgreturneddate ? (
                <div className={savedFieldStyle}>
                  {moment(abgreturneddate).format("DD-MM-YYYY")}
                </div>
              ) : (
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
              )}

              <label
                htmlFor="pbgreturneddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                PBG returned/extinguished date:
              </label>

              {gendata?.bgdata?.pbgreturneddate ? (
                <div className={savedFieldStyle}>
                  {moment(pbgreturneddate).format("DD-MM-YYYY")}
                </div>
              ) : (
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
              )}

              <label
                htmlFor="bgremarks"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Remarks on BG's:
              </label>

              {gendata?.bgdata?.bgremarks ? (
                <div className={savedFieldStyle}>
                  {bgremarks}
                </div>
              ) : (
                <input
                  type="text"
                  name="bgremarks"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pb-20 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="bgremarks"
                  value={bgremarks}
                  onChange={(e) => setBgremarks(e.target.value)}
                  placeholder="e.g....bank name which issued BG/ any free text comment by MM/finance"
                />
              )}
            </div>
            <button
              type="submit"
              onClick={!editGeneralData ? handleSubmitGendata : handleEditGendata}
              className="absolute p-3 rounded-lg bg-sky-800/10 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/3"
              disabled={activeBlock === "generalData"}
            >
              {activeBlock === "generalData" ? "Saving..." : (!editGeneralData ? "Save" : "Edit")}
            </button>

            {/* Bonds / guarantees released back to supplier */}
          </div>
        )}

        {/* L/C details */}

        {lcflagged ? null : (
          <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-44 pb-28 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
            <div className="text-[14px] font-italic py-3 px-6  bg-purple-600 text-white">
              <h3 className="justify-center align-middle">
                {" "}
                Letter of Credit
                <br /> Data{" "}
              </h3>
              <br />

              <input
                  id="lctabchk"
                  type="checkbox"
                  onChange={(e) => setLctab(e.target.value)}
                  value="not applicable"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="lctabchk"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Not Applicable
                </label>
            </div>

            <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
              <label
                htmlFor="lcestopendate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC Open date estimated:{" "}
              </label>

              {gendata?.lcdata?.lcestopendate ? (
                <div className={savedFieldStyleWide}>
                  {moment(lcestopendate).format("DD-MM-YYYY")}
                </div>
              ) : (
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
              )}

              <label
                htmlFor="lcincoterm"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                L C Incoterm:{" "}
              </label>

              {gendata?.lcdata?.lcincoterm ? (
                <div className={savedFieldStyleWide}>
                  {lcincoterm}
                </div>
              ) : (
                <input
                  type="text"
                  id="lcincoterm"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="CIF/DDP/Ex-w..."
                  value={lcincoterm}
                  onChange={(e) => setLcincoterm(e.target.value)}
                />
              )}

              <label
                htmlFor="lcamount"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Enter L/C Amount
              </label>

              {gendata?.lcdata?.lcamount ? (
                <div className={savedFieldStyleWide}>
                  {lcamount}
                </div>
              ) : (
                <input
                  type="text"
                  name="lcamount"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="lcamount"
                  // pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
                  value={lcamount}
                  // data-type="currency"
                  onChange={(e) => setLcamount(e.target.value)}
                  placeholder="SAR500,000.00"
                />
              )}
            </div>
            <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
              <label
                htmlFor="lcdocuments"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC Documents:{" "}
              </label>

              {gendata?.lcdata?.lcdocuments ? (
                <div className={savedFieldStyleWide}>
                  {lcdocuments}
                </div>
              ) : (
                <input
                  type="text"
                  id="lcdocuments"
                  value={lcdocuments}
                  onChange={(e) => setLcdocuments(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4  p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Original Invoice/Bill of Lading/..."
                />
              )}

              <label
                htmlFor="lcdatadate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC data requested & received from supplier:
              </label>

              {gendata?.lcdata?.lcdatadate ? (
                <div className={savedFieldStyleWide}>
                  {moment(lcdatadate).format("DD-MM-YYYY")}
                </div>
              ) : (
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
              )}

              <label
                htmlFor="lcopeneddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC opened date: (swift advice from bank)
              </label>

              {gendata?.lcdata?.lcopeneddate ? (
                <div className={savedFieldStyleWide}>
                  {moment(lcopeneddate).format("DD-MM-YYYY")}
                </div>
              ) : (
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
              )}
            </div>

            <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
              <label
                htmlFor="lcswift"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC Swift Number & Bank:
              </label>

              {gendata?.lcdata?.lcswift ? (
                <div className={savedFieldStyleWide}>
                  {lcswift}
                </div>
              ) : (
                <input
                  type="text"
                  id="lcswift"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Original Invoice/Bill of Lading/..."
                  value={lcswift}
                  onChange={(e) => setLcswift(e.target.value)}
                />
              )}

              <label
                htmlFor="lclastshipdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC Last shipment date:
              </label>

              {gendata?.lcdata?.lclastshipdate ? (
                <div className={savedFieldStyleWide}>
                  {moment(lclastshipdate).format("DD-MM-YYYY")}
                </div>
              ) : (
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
              )}

              <label
                htmlFor="lcexpirydate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC Expiry Date:
              </label>

              {gendata?.lcdata?.lcexpirydate ? (
                <div className={savedFieldStyleWide}>
                  {moment(lcexpirydate).format("DD-MM-YYYY")}
                </div>
              ) : (
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
              )}
            </div>

            <div className="flex-1 shadow-xl px-3 bg-purple-100/70">
              <label
                htmlFor="lcremarks"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                LC Remarks
              </label>

              {gendata?.lcdata?.lcremarks ? (
                <div className={savedFieldStyleWide}>
                  {lcremarks}
                </div>
              ) : (
                <input
                  type="textarea"
                  id="lcremarks"
                  className="bg-gray-50 border border-gray-300 pb-64 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-1/2 p-2.5  mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Any free text remarks by JAL Fin / Proj/ MMD/..."
                  value={lcremarks}
                  onChange={(e) => setLcremarks(e.target.value)}
                />
              )}
            </div>
            <button
              type="submit"
              onClick={!editGeneralData ? handleSubmitGendata : handleEditGendata}
              className="absolute p-3 rounded-lg bg-purple-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-2/3"
              disabled={activeBlock === "generalData"}
            >
              {activeBlock === "generalData" ? "Saving..." : (!editGeneralData ? "Save" : "Edit")}
            </button>
          </div>
        )}

        {/* progress milestones */}

        {testflagged ? null : (
          <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
            <div className="text-[14px] font-italic py-3 px-6  bg-fuchsia-600 text-white">
              <h3 className="justify-center align-middle">
                {" "}
                Progress <br /> Milestones
                <br /> Data
              </h3>
              <br />
              <input
                  id="testingtabchk"
                  type="checkbox"
                  onChange={(e) => setTesting(e.target.value)}
                  value="not applicable"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="testingtabchk"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Not Applicable
                </label>
            </div>

            <div className="flex-1 shadow-xl px-3 bg-fuchsia-100/70">
              <label
                htmlFor="mfgstart"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Actual Manufacturing start Date:
              </label>

              {gendata?.progressdata?.mfgstart ? (
                <div className={savedFieldStyle}>
                  {moment(mfgstart).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={mfgstart}
                  onChange={(date) => setMfgstart(date)}
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
                htmlFor="Fatdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                FAT/Final inspection date:
              </label>

              {gendata?.progressdata?.Fatdate ? (
                <div className={savedFieldStyle}>
                  {moment(Fatdate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={Fatdate}
                  onChange={(date) => setFatdate(date)}
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

            <div className="flex-1 shadow-xl px-3 bg-fuchsia-100/70">
              <label
                htmlFor="Fatreportdate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                TPI /Final inspection report received date:
              </label>

              {gendata?.progressdata?.Fatreportdate ? (
                <div className={savedFieldStyle}>
                  {moment(Fatreportdate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={Fatreportdate}
                  onChange={(date) => setFatreportdate(date)}
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
                htmlFor="Bldate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                B/L/ AWB booked date
              </label>

              {gendata?.progressdata?.Bldate ? (
                <div className={savedFieldStyle}>
                  {moment(Bldate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={Bldate}
                  onChange={(date) => setBldate(date)}
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

            <div className="flex-1 shadow-xl px-3 bg-fuchsia-100/70">
              <label
                htmlFor="vesselreacheddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Flight/vessel reached date
              </label>

              {gendata?.progressdata?.vesselreacheddate ? (
                <div className={savedFieldStyle}>
                  {moment(vesselreacheddate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={vesselreacheddate}
                  onChange={(date) => setVesselreacheddate(date)}
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
                htmlFor="customscleareddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Customs cleared/ Bayyan paid date
              </label>

              {gendata?.progressdata?.customscleareddate ? (
                <div className={savedFieldStyle}>
                  {moment(customscleareddate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={customscleareddate}
                  onChange={(date) => setCustomscleareddate(date)}
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
            <button
              type="submit"
              onClick={!editGeneralData ? handleSubmitGendata : handleEditGendata}
              className="absolute p-3 rounded-lg bg-fuchsia-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/2"
              disabled={activeBlock === "generalData"}
            >
              {activeBlock === "generalData" ? "Saving..." : (!editGeneralData ? "Save" : "Edit")}
            </button>
          </div>
        )}

        {/* Packing & Shipment details */}

        {shipflagged ? null : (
          <div className="relative py-6 mb-3 flex gap-1 overflow-hidden  border-y-2 border-slate-400 rounded-lg shadow-lg  m-9 pt-20 pb-20 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
            <div className="text-[14px] font-italic py-3 px-6  bg-amber-600 text-white">
              <h3 className="justify-center align-middle">
                {" "}
                Packing & <br /> Shipment <br /> Related <br /> Data (for
                Ex-works only)
              </h3>

              <br /> 

              <input
                  id="shiptabchk"
                  type="checkbox"
                  onChange={(e) => setShipping(e.target.value)}
                  value="not applicable"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="shiptabchk"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Not Applicable
                </label>
            </div>

            <div className="flex-1 shadow-xl px-3 bg-amber-100/70">
              <label
                htmlFor="dimensions"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Gross weight/dimensions (appx) in KG/Metric dimensions
              </label>

              {gendata?.shipdata?.grossweight ? (
                <div className={savedFieldStyle}>
                  {grossweight}
                </div>
              ) : (
                <input
                  type="text"
                  id="dimensions"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pb-3 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Gross weight (Kg) and dimensions (Metric)/..."
                  value={grossweight}
                  onChange={(e) => setGrossweight(e.target.value)}
                />
              )}

              <label
                htmlFor="shipmentbookedddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Shipment is booked on:
              </label>

              {gendata?.shipdata?.shipmentbookeddate ? (
                <div className={savedFieldStyle}>
                  {moment(shipmentbookeddate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={shipmentbookeddate}
                  onChange={(date) => setShipmentbookeddate(date)}
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

            <div className="flex-1 shadow-xl px-3 bg-amber-100/70">
              <label
                htmlFor="saberapplieddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                SABER applied on:
              </label>

              {gendata?.shipdata?.saberapplieddate ? (
                <div className={savedFieldStyle}>
                  {moment(saberapplieddate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={saberapplieddate}
                  onChange={(date) => setSaberapplieddate(date)}
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
                htmlFor="saberreceiveddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                SABER received on:
              </label>

              {gendata?.shipdata?.saberreceiveddate ? (
                <div className={savedFieldStyle}>
                  {moment(saberreceiveddate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={saberreceiveddate}
                  onChange={(date) => setSaberreceiveddate(date)}
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

            <div className="flex-1 shadow-xl px-3 bg-amber-100/70">
              <label
                htmlFor="ffnominateddate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Freight forwarder nominated on
              </label>

              {gendata?.shipdata?.ffnoMinateddate ? (
                <div className={savedFieldStyle}>
                  {moment(ffnoMinateddate).format("DD-MM-YYYY")}
                </div>
              ) : (
                <DatePicker
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  selected={ffnoMinateddate}
                  onChange={(date) => setFfnoMinateddate(date)}
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
                htmlFor="finalremarks"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                FINAL REMARKS ON PO:
              </label>

              {gendata?.shipdata?.finalremarks ? (
                <div className={savedFieldStyle}>
                  {finalremarks}
                </div>
              ) : (
                <input
                  type="text"
                  id="finalremarks"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pb-28 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="FINAL REMARKS IF ANY..."
                  value={finalremarks}
                  onChange={(e) => setFinalremarks(e.target.value)}
                />
              )}
            </div>

            <button
              type="submit"
              onClick={!editGeneralData ? handleSubmitGendata : handleEditGendata}
              className="absolute p-3 rounded-lg bg-amber-800/30 shadow-lg shadow-slate-500 text-sm text-slate-800 font-bold right-5 top-1/2"
              disabled={activeBlock === "generalData"}
            >
              {activeBlock === "generalData" ? "Saving..." : (!editGeneralData ? "Save" : "Edit")}
            </button>
          </div>
        )}
      </form>

      <section className="container px-4 w-full mx-auto">
        <div className="flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-200 dark:bg-gray-800">
                    <tr className="font-bold text-[12px] ">
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left rtl:text-right text-gray-800 dark:text-gray-400"
                      >
                        Material code/group
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left rtl:text-right text-gray-800 dark:text-gray-400"
                      >
                        Material description
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Unit rate/currency
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left rtl:text-right text-gray-800 dark:text-gray-400"
                      >
                        Item value
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending Value
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5  text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending Inv Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3.5 text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Pending Inv value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                    {poheader.map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 text-[12px] font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row.material["matcode"]}/{row.material["matgroup"]}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row.material["matdescription"]}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-light text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-quantity"].$numberDecimal}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-unit-of-measure"]}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-unit-price"].toLocaleString()}/{row.currency}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-medium text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["po-value-sar"].toLocaleString("en-US", {
                            style: "currency",
                            currency: "SAR",
                          })}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["pending-qty"].$numberDecimal}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-light text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["pending-val-sar"].toLocaleString("en-US", {
                            style: "currency",
                            currency: "SAR",
                          })}
                        </td>
                        <td className="px-4 py-4 text-[12px] font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {row["pending-inv-qty"].$numberDecimal}
                        </td>
                        <td className="px-4 py-4 text-[12px] text-right font-light text-gray-700 dark:text-gray-200 whitespace-nowrap">
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

import React, { useState, useEffect } from "react";
import moment, { relativeTimeRounding } from "moment";

import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";

import DatePicker from "react-datepicker";

import useDebounce from "../lib/useDebounce";

const departments = [
  "Search...",
  "Warehouse",
  "ESD",
  "ISD",
  "FI",
  "Management",
  "Manpower",
  "HR",
  "Facility",
];

const calibprojects = [
  "4400010630 - UPGRADEE2:E241 5 PROTN LINE IN JUB",
  "4400010633- UPGRADE OF TFR PROT AT JUBAI",
  "4400010632 - UPGRADE OF TFR IN HFR BATIN",
  "55000280 PSA PANEL INTEGRATION",
  "Supply & Exp. of RTU & SOE at New Jubail",
  "GAS ADDITIONAL PO# 5500115572",
  "4300176884 : Al-Bayroni - Upgrade Trafo",
  "PO# DP28780-Supply Generator panels NG",
  "4503719332:-PROTECTION FOR DEPROPONIZER",
  "55000286 | ARAMCO 50 PANEL",
  "REPAIR OF HOT AND COLD COMBUSTOR",
  "PLATFORMS FOR SW SUMPS",
  "RAW WATER HYDRAULIC IMPROVMENT PROJECT",
  "RENOVATION AND COMBINED OFFICE IN ROOM 1",
  "PO4503743651 Aramox Nitrogen Backup Proj",
  "55000292 - Control & Power Cable Supply",
  "Exp. of RTU & SOE at BGCS-1",
  "PO#4503722398 GROUN PREPARATION ARRANGEM",
  "AL HASSA WORKS",
  "SAFANIYAH C&R 55000301",
  "INSTALATION OF PIPE SUPPORTS AT HPU UNIT",
  "4300215072 | METER INSPECTION & CALIBRAT",
  "Supply of GE D25 RTU (ALMEER)",
  "Exp. of RTU@Khurais SS(Saipem)",
  "Exp. of RTU & SOE (K.E.C)",
  "AROMAX PHASE 2 PROJECT",
  "PO-4503800242 Nitrogen Purge Line to Dru",
  "Motorola RTU for Irrigation system",
  "Exp. of RTU@Aindar WIP(Enppi)",
  "PES20 PO3200000082 MODI. OF PH ANALYZER",
  "NITROGEN PURGE LINE TO DRUM 41D04AB,PO-4",
  "4400011417 - RABIGH POWER PLANT",
  "IS/GP.19.001:-PRODUCT LINE ENHANCEMENT",
  "Supply of D25 RTU",
  "PES-022 TO PROVIDE EXTERNAL FLUSHING TO",
  "55000371-New Jubail Residential Microsol",
  "55000372 | GE PLC, JECPI, AL-KHIFAH",
  "17295/33/17 | ENERGY METER REPLACEMENT",
  "55000374 | Panel Integration for TFR",
  "55000374 - Supply of TWFL panel for SAIT",
  "55000375 | 69kV UG Cable Replacement",
  "PES-030 SPILL BACK OF KEROSEN PUMP",
  "55000270 Abunayan PLC panel integration",
  "Panel Integration(Abunayyan)_P.O#7002304",
  "INSTALATION OF LIGHTING FIXTURE AT PAU M",
  "55000378 | Replacement of Obsolete RTU",
  "MPP PANEL CABLING SERVICES",
  "Instrumentation & Process control works",
  "55000381 | SCADA, SOE & FR_RC Project 38",
  "NSA-19-PO-174 | PERMANENT COMM. SYSTEM",
  "SUPPLY & INSTALL SHADE FOR SWIMMING POOL",
  "Emergency DG Replacement in OLE-I",
  "6690000921 | Upgrade Emergency Generator",
  "GCS-SAFCO-SP-174000111-Replace Disp Levl",
  "GCS-IBB-SP-183100085-Passivation air spp",
  "55000374 - Supply of TWFL Panels",
  "PO#3200000101 SWS PROJECT",
  "IS/GP.20.001:- SABIC GCS E&PM SAFCO-PO-3",
  "SURGE POND:- SABIC PO 4801756913",
  "55000394|T&C HAREDA 132/13.8KV S/S",
  "Replacement of Power Generators at Petro",
  "SF2-Provide 3-PIC-170A Indication",
  "IS/GP.20.004:- SABIC PO # 4801760669-SP",
  "SABIC PO 4801764366",
  "SABIC PO 4801764367",
  "SABIC PO 4801764368",
  "SABIC PO 4801764369",
  "5800000546 RENOVATION OF CONFERANCE ROOM",
  "SAIT TWFL PANEL WORK",
  "SP-193100005-Pneumatic controller replac",
  "PO.4801785805,Upgarde 2008-J GENERATOR@",
  "55000403 | Supply of D25 - Naizak",
  "Changed to EDSS20.003 -  MUHAYEL Project",
  "4400013322-ADDING 3RD TFR IN OUKDUD",
  "55000407 | SFC Replace HV Eqpt @ YCOT",
  "4400013272-ADDING 3RD TFR IN MUHAYEL",
  "55000408 - Replace DC Charger & Battery",
  "55000409|Upgrade G500 at Safaniyah Sub12",
  "IS/GP.20.012 :- MOC3293 ADITIONAL ON OFF",
  "IBNZAHAR:-SP-153300003 Replacement of 41",
  "4500395827 | New ATS",
  "PES-116 ,MHC/DHC COMMON DISCHARGE MANIFO",
  "IS/GP.20.015:- DE COMPOSSER PROJECT",
  "SP-17120035 (C3 PROJECT EXTRA SCOPE)",
  "SP-17120035 (C3 PROJECT EXTRA SCOPE)",
  "IBRIP20 INST LUMPSUM AMM CONV&URDCS LAMP",
  "SF2- Fire protection for Main Substation",
  "SF3 - To provide UPS/Battery Room Temper",
  "SF4 - UPS alarms and rooms temperatures",
  "SP-194000059 (SF5-To install individual",
  "PES-118 TO INSTALL PERMINANT PLATFORM AT",
  "PES 121-MOC-52-3263 Reroute Pump 661-",
  "SP-183100006- 4801846561 Methanator",
  "Karl Fisher Volumetric Titrator",
  "SP-184000111 (To connect SF-V boiler blo",
  "4400013969 | IMPROVE SCADA RTU EOA",
  "4400014021 | UPGRADE CTRL EQPT MAKKAH",
  "PES-127 Transform the HR Reception Into",
  "SP-191700002 (Installation of Oxygen Det",
  "SP-194000097- (SF4- install a HIC on LPC",
  "SP-184000100: SF4 – To replace the exist",
  "SP-171200005- To Change 3F-1401 A/B from",
  "Sea Water Pipeline to Power and Utilitie",
  "4801882364- ALB-302-JTC Vacuum Improveme",
  "SP-184000008 (Additional PIV facility fo",
  "SP-184000018 (SF2- To provide Alternate",
  "SP-184000021(SF2- To provide Alternative",
  "Supply and  Installation of 01 Number GC",
  "INSTALLATION OF 1 DENSITY/SPE",
  "SP-184000008 (Additional PIV facility fo",
  "4400014385 | Replacement of CCVT",
  "Connect 156-F Drain from Waste Water (V-",
  "H2 Detector,SP-191700005",
  "4501131166 | WHB SS T&C Project",
  "Permanent removal of HP Steam NRV in tie",
  "SP-194000098 SF4-Additional trap to be",
  "SP-191700005 :-H2 and CO detectors",
  "SP-184000084SF4-Provide a strainer with",
  "SP-184000091_SF4 - To Upgrade 42-AT-2001",
  "SP-191700023 ALB - Obsolete Sea Water Le",
  "SP-202800000- SAMAC-Scrubebr Tie-in",
  "SP-174000110-Steam Drum Level Switch",
  "SP-194000070: Replace the existing Phosp",
  "SP-194000061 : SF-3Provide double block",
  "4500427156 | INSTALL OF TRANSDUCER",
  "4500427754 | Trafo. Diff. Relay Replace",
  "4500429861 | Replace Line Protn MDNOD",
  "SP-204000004-SF5 – Provide double block",
  "SP-194000029 Provide SACP for the PIV (P",
  "SP-194000026-SF-4 As per RC recommendati",
  "SP-194000039-SF4-Provide flowmeter at Ur",
  "SP-194000064-SF4-Provide flowmeter on va",
  "Project Definition IS/GP.21.030 :- REPLA",
  "4300446616 - Replace Power Cable",
  "4400015160 ALAHAD 33/13.8KV S/S",
  "SP-191600012 Ibnsina Truck unloading",
  "4400015144 | REPLACEMENT OF RTU IN HAIL",
  "SIPCHEM (Instrumentation work)",
  "4500435953 | O/C relay & Trafo relay",
  "SP-202100001 : Upgradation of Flare Igni",
  "4400015315 | CONNECT FOA SS TO SCADA",
  "SP-202000005 Vent Flow Meter Installatio",
  "SP-171700009: Installation of Pulsation",
  "SP-201900013 : Change the Flow Meter",
  "SP-174000129To provide PT with DCS indic",
  "IBN ZAHAR :- TO UPGRADE ANTI SURGE VALVE",
  "4400015497 | Hawiah & Qudirah REHAB",
  "SP-201700024:-Replacement of First Stage",
  "PO#4801971496 Upgrade Anti Surge Valve",
  "SP-191700038 - Replacement of Converter",
  "4400015860 - CONST OF 132/13.8KV NARJIS",
  "P210387 - RTU LOOSE MATERIAL",
  "4400015972 | REHABLITATIN OF 110KV TPS",
  "4800020215 | SCADA, SOE & DSM (ALFANAR)",
  "4500227663 | Six Mobile S/S, Hitachi",
  "SP-191700017(FLOW METER INSTALATION )",
  "Wind Break Barriers of Rock Phosphate Op",
  "SP-204000038 : SF2-Provide double block",
  "PO 4802012115 Upgrade Ole-I Furnace Trip",
  "4400015160 | AL-AHAD 33/13.8KV S/S",
  "SP-204000061 SF 2 To replace 2 LV 905 G3",
  "SP-214000036  Procure&Install trip switc",
  "SP-184000025 (SF2 - To Provide On-Line V",
  "SP-174000140 , SF2 – Replacement of  1-L",
  "SP-202100013 Installation of Ultrasonic",
  "SP-184000006 -  Replace Obsolete Pneumat",
  "SP-184000010 -SF2 - Providing Automatic",
  "SP-194000014- SF3-Replace HP ammonia pum",
  "SP-172000001 PETROKEMYA DIESEL WATER PU",
  "ALB UTY – PLC – 200 1K PLC System upgrad",
  "4500465496 | 36 LINE DIFF RELAY REPLACE",
  "4400016556 | Transformer T&C Najran PP",
  "SP-184000019_Rectification of fire hydra",
  "SP-174000145 SF2-Replacing 1-LV235 with",
  "SP-204000020 UPGRADATION OF PROCESS COND",
  "SP-214000054 -AN4 Provide additional 12IN",
  "SP-204000022 - SF4 UT To install a Condu",
  "SP-214000030 To replace flame scanners i",
  "4400016836 | U/V & U/F Replace @ SOA",
  "4400017179 TUWAIQ 132/13.8KV SS#8249",
  "PO-003053 - CSAS RTU PANEL GAS PIPELINE",
  "Rehab of MUJAHIDIN SS",
  "SP-224000012 | To divert LPCC bypass to",
  "SP-224000006:  AN2-UT To install pressur",
  "2000-2022-4119-AC | RTU Exp At ABSF TP-2",
  "Expansion of Existing D20 RTU at ABSF TP",
  "Additional Walkway and Lighting on both",
  "SP-20400039 - SF3 - DOUBLE BLOCK & BLEED",
  "SP-224_59 cooling BF water valve inlet",
  "PES-172 MOC-52-2197, PROVIDE SPILL BACK",
  "MOC-52-4325 BYPASS CONDUCTOR FOR FLOATIN",
  "organic vent scrubber",
  "MOC-4294,COKE DRUM DRAIN LINE MODIFICTON",
  "4400018040 | 230kV SHEDGUM UPGRADE",
  "SP-164000014- PROVIDING BLOCK AND BLEED",
  "Replacement of RTU at Uthmaniyah GOSP#10",
  "GYPSUM LEACHATE RECOVERY SYSTEM-EPC",
  "SP-191600013. Analyzer Cabinet Foundatio",
  "PES-188/MOC-52-5403 Extension of parking",
  "MOC-52-4275/4276 ASPHALT CAR PARKING",
  "SP-213300009 C3 Feed Analyzer Ibn Zahr",
  "MOC-52-5085/JET TANKS DEWATERING",
  "MOC-52-4519 CANOPY FOR SS-1104/1105/PIB",
  "4400018314 | 43BD Jubail North 13.8kV CB",
  "SP-2053-Oxygen & Conductivity Analyser",
  "RTU Exp at Safaniyah Sub10 & 14",
  "PES-195-Deaerator-B Piping & Structure",
  "Rep of SOE, FR, AVR, SYNCH 4400018558",
  "JUMPOVER FROM KFIP IMPORT PO#3200000168",
  "IIB-2024 TA PROJECT:- (PROVIDE 2 EA ISOL",
  "4500235313 - Six Mobile Stations",
  "SP-223300008: Re-routing of degassing co",
  "SP-223100016/IBB-UR DETECTOR INSTALATION",
  "SP-224000012 | To divert LPCC bypass to",
  "SP-233300013(SP-223300002-15)",
  "Upgrade existing RTU with G500 at Berri",
  "MOC#5642-Renovation of CEO Wing",
  "PAP-6A00 Unit Train-A Hot Well Return He",
  "DFR Panel Integration - JAFURAH",
  "SP-224000064 -SF3-To divert LPCC bypass:",
  "DFR PANEL INTEGRATION -Waad Al Shamaal",
  "NEW SOE - MAJARDAH & THORYBAN SS",
  "SP-203100004:-IBB-Conductivity and Disso",
  "To Install 31 New Analyzers  SP-23330001",
  "RTU Exp -SS-7623-PAC-3365/2023",
  "RTU Exp -7212,7213,7219-PAC-3364/2023",
  "Al Ghat Wind Project - DFR & DSM Panel",
  "TFR & DSM Panel Integration - ADWAN",
  "SP-203100008 : IBB – PT UPGRADATION",
  "SP-204000044 - SF-2-SAFETY SHOWER",
  "SP-204000036 : SAFCO -SAFETY SHOWER",
  "SP-223300002.14 . KEMYA METHANOL SYNERGY",
  "IBB-MAINTANANCE MOC-HANDRAIL PROJECT",
  "SAFCO -PROJECT CODE-DO NOT USE TILL NEW",
  "SP-211600001 LTRU COMPRESSOR TURBINE",
  "SP-211600001 LTRU COMPRESSOR TURBINE",
  "SCADA INTERCONNECTION - 6511145926",
  "Supply of GE D25 RTUs. - MARJAN GOSP4",
  "GULF CRYO TIE IN WORKS IS/CP.24.003",
  "AR Rass PV - PANEL INTEGRATION",
  "OLAYA SS - TAREG/NG/OLY/E/PO/011",
  "AR Rass PV 380kv BSP(9095) TFR & DSM PAN",
  "SP-223100006 : To upgrade specified line",
  "YANBU WIND - DFR, DSM & FL",
  "Supply of ACCS Panel - 8033 & 8118",
  "Temporary Repair of upheaved Scrubber Ar",
  "SP-212000012 Area Monitoring in ABS PKS",
  "Warehouse - Jubail",
  "Warehouse - Dammam",
];



function Userform1({ equip }) {
  // form related
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [value, setValue] = useState("");
  const [empname, setEmpname] = useState(null);
  const [searchstring, setSearchstring] = useState("Search...");
  const [projectstr, setProjectstr] = useState("Search..");
  const [datefrom, setDatefrom] = useState(new Date());
  const [dateto, setDateto] = useState(null);

  const debouncedValue = useDebounce(value, 200);


  const [equipcustodyinfo, setEquipcustodyinfo] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/usermaster/${value}`);
      const json = await result.json();

      setEmpname(json.empname);
    })();
  }, [debouncedValue]);

  const getEmpnumber = (e) => setValue(e.target.value);

  const onSubmit = async (data) => {
    data = { ...data, equip, user: "suresh", datefrom, dateto };
    console.log(data);

    

    await fetch("/api/calibequipmentcustody", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    await fetch(`/api/fixedassets/custodyInfo/${equip}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    

    toast.success("submitted succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    reset();
    setEmpname(null);
    setValue("");
    setSearchstring("Search...");
    setProjectstr("Search...");
    setDateto(null);
    router.reload();
  };

  const onErrors = (errors) => console.error(errors);

  useEffect(() => {
    const fetchEquipcustodyinfo = async () => {
      const response = await fetch(`/api/calibequipmentcustody/${equip}`);
      const json = await response.json();
      setEquipcustodyinfo(json);
    };
    fetchEquipcustodyinfo();
  }, [equip]);

  console.log(equipcustodyinfo);

  return (
    <main className="w-full min-h-full">
      <div className="relative mx-auto w-full min-h-full rounded-lg  shadow-lg">
        <div className=" p-1 bg-zinc-50 rounded-md grid grid-cols-3 gap-3 min-h-full">
          <div className="col-span-1">
            <h1 className="font-bold flex justify-center text-[14px] mb-1 border-b-2 border-teal-900">
              User/custodian info for Equipment : {equip}
            </h1>
            <div className=" mb-1 ">
              <div className="flex justify-between font-bold text-stone-900 text-[12px] font-Lato">
                <p className=" text-stone-800/80  "> Custodian Name: </p>
                <p>{equipcustodyinfo[0]?.custodianname}</p>
              </div>
              <div className="font-bold  text-[12px] font-Lato flex justify-between">
                <p className=" text-stone-800/80  "> Custodian Emp Number:</p>{" "}
                <p> {equipcustodyinfo[0]?.custodianempnumber}</p>
              </div>
            </div>

            <div className="flex flex-col  mb-1 pb-1">
              <div className="flex justify-between ">
                <p className="text-green-900 font-bold text-[12px] ">
                  {" "}
                  Department:{" "}
                </p>
                <p className="text-stone-800 text-[10px] font-bold">
                  {equipcustodyinfo[0]?.department}{" "}
                </p>
              </div>

              <div className="flex justify-between ">
                <p className="text-stone-900 font-semibold text-[12px] ">
                  {" "}
                  Project:
                </p>
                <p className="text-stone-800/60 font-bold text-[10px]">{equipcustodyinfo[0]?.project} </p>
              </div>
            </div>

            <div className="text-stone-800/60 font-Lato text-[13px] font-semibold">
              If warehouse, rack location:<span className="text-stone-800"> {equipcustodyinfo[0]?.racklocation}</span>
            </div>

            <div className="flex justify-between border-t-2  mb-1 mt-1 align-middle border-b-2 pb-1 border-green-900">
              <h3 className="font-bold text-[12px]"> Custody from: </h3>
              <h3 className="font-bold text-[12px] text-red-800">
                {moment(equipcustodyinfo[0]?.custodyfrom).format("DD/MM/YYYY")}
              </h3>
            </div>
            <h5 className="font-semibold text-[12px] text-stone-900">
              {" "}
              Remarks: {equipcustodyinfo[0]?.remarks}
            </h5>

            <div className="bg-red-100 pb-1 px-2 pt-6 ">
              <h3 className="text-[14px] font-bold border-b-2 pb-3 border-stone-900 text-stone-900">
                Previous Custody History:{" "}
              </h3>
              <div className="grid grid-cols-4 gap-1 text-[12px] font-semibold border-b-2 border-blue-900 text-zinc-900">
                <h5> Custodian </h5>
                <h5> Department </h5>
                <h5> From: </h5>
                <h5> To: </h5>
              </div>
              {equipcustodyinfo.map((custody, index) => (
                <div className="grid grid-cols-4 gap-1 font-semibold text-zinc-900 border-b-2 border-stone-800/70 pb-1">
                  <h6 className="text-[8px] tracking-tighter">
                    {" "}
                    {custody.custodianname}{" "}
                  </h6>
                  <h6 className="text-[10px] tracking-tighter">
                    
                    {custody.department}
                  </h6>
                  <h6 className="text-[10px] tracking-tighter">
                    {" "}
                    {moment(custody.custodyfrom).format("DD-MM-YYYY")}
                  </h6>
                  <h6 className="text-[10px] tracking-tighter">
                    {" "}
                    {custody.custodyto ? moment(custody.custodyto).format("DD-MM-YYYY") : null }
                  </h6>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-pink-100 col-span-2"> 
          <main className="w-full min-h-full p-1">
      <div className="flex justify-center bg-orange-50/90 align-middle">
        <form onSubmit={handleSubmit(onSubmit, onErrors)}>
          <div className="w-full  pr-2">
            {/* the form */}

            <div className="flex flex-col p-1 ">
              <div className="flex flex-col sm:flex-row items-center">
                <h2 className="font-black text-[14px] mr-auto text-sky-900 tracking-wider">
                  Equipment Custody Information:
                </h2>
                <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"></div>
              </div>

              <div className="mt-5">
                <div>
                  <div className="md:flex flex-row md:space-x-4 w-full text-xs">
                    {/* equipment complete name */}
                    <div className="mb-3 space-y-2 w-full text-xs">
                      <label className="font-bold text-gray-600 py-2">
                        Custodian Emp Number: <abbr title="required">*</abbr>
                      </label>
                      <input
                        placeholder="Employee Number"
                        className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-8 px-4"
                        required="required"
                        type="text"
                        name="empnumber"
                        id="empnumber"
                        {...register("empnumber")}
                        onChange={getEmpnumber}
                      />
                    </div>

                    <div className="mb-3 space-y-2 w-full text-xs">
                      <label className="font-bold text-gray-600 py-2">
                        Employee Name: <abbr title="required">*</abbr>
                      </label>
                      <input
                        placeholder="Employee Name"
                        className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-8 px-4"
                        required="required"
                        type="text"
                        name="empname"
                        id="empname"
                        value={empname}
                        {...register("empname")}
                      />
                    </div>

                    <div className="mb-3 space-y-2 w-full text-xs">
                      <label className="font-bold text-gray-600 py-2 w-1/2">
                        Department <abbr title="required">*</abbr>
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="dept"
                          className="placeholder:text-[10px] placeholder:font-Roboto placeholder:text-red-800 border-0 border-none appearance-none w-2/3  focus:border-none focus:border-0 focus:outline-none "
                          placeholder="...type char to search.."
                          id="dept"
                          onChange={(e) => setSearchstring(e.target.value)}
                        />

                        <input
                          placeholder="Department"
                          className="appearance-none font-bold block w-full bg-grey-lighter text-grey-darker h-5 py-4 ml-3"
                          required="required"
                          type="text"
                          name="department"
                          id="department"
                          value={departments.filter((str) =>
                            str
                              .toLowerCase()
                              .includes(
                                useDebounce(searchstring.toLowerCase(), 200)
                              )
                          )}
                          {...register("department", {
                            required:
                              "department name has to be searched and filled",
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:flex md:flex-row md:space-x-4 w-full text-xs ">
                    <div className="w-1/2 flex flex-col mb-3">
                      <label className="font-bold text-gray-600 py-2 ">
                        Search project...
                      </label>
                      <input
                        placeholder="Project Name"
                        className="appearance-none block w-1/2 bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-8 px-4"
                        type="text"
                        name="projectstr"
                        id="projectstr"
                        onChange={(e) => setProjectstr(e.target.value)}
                      />
                    </div>
                    <div className="w-full flex flex-col mb-3">
                      <label className="font-bold text-[12px] text-gray-600 py-2 ">
                        Used in which project:(If warehouse choose Jubail /
                        Dammam)
                      </label>
                      <input
                        placeholder="Project Name"
                        className="appearance-none block w-full font-bold  bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg h-8 px-4"
                        type="text"
                        name="project"
                        id="project"
                        value={calibprojects.filter((proj) =>
                          proj.toLowerCase().includes(projectstr.toLowerCase())
                        )}
                        {...register("project", {
                          required: "project where Equipment used is required",
                        })}
                      />
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col mb-3">
                    <label className="font-bold text-gray-600 text-[12px] py-1">
                      Rack/bin (if custody by warehouse){" "}
                      <abbr title="required">*</abbr>
                    </label>
                    <input
                      className="block w-1/2 bg-grey-lighter text-[12px] text-grey-darker border border-grey-lighter rounded-lg h-8 px-4 md:w-full "
                      required="required"
                      type="text"
                      name="racklocation"
                      id="racklocation"
                      {...register("racklocation")}
                    ></input>
                    <p className="text-sm text-red-500 hidden mt-3" id="error">
                      Please fill out this field.
                    </p>
                  </div>

                  <div className="md:flex md:flex-row md:space-x-4 w-full text-xs">
                    <div className="w-full flex flex-col mb-3">
                      <label className="font-bold text-gray-600 py-2">
                        Equipment custody from: <abbr title="required">*</abbr>
                      </label>
                      <DatePicker
                        className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        selected={datefrom}
                        onChange={(date) => {
                          setDatefrom(date);
                        }}
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
                    <div className="w-full flex flex-col mb-3">
                      <label className="font-bold text-gray-600 py-2">
                        Equipment custody to
                      </label>
                      <DatePicker
                        className="h-6 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/3 p-2.5 mb-6  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        selected={dateto}
                        onChange={(date) => {
                          setDateto(date);
                        }}
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

                  <div className="flex-auto w-full mb-1 text-xs space-y-2">
                    <label className="font-bold text-gray-600 py-2">
                      Remarks if any :
                    </label>
                    <textarea
                      name="remarks"
                      id="remarks"
                      className=" min-h-[60px] max-h-[100px] h-16 appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded-lg  py-4 px-4"
                      placeholder="Enter remarks/comments if any...."
                      spellCheck="false"
                      {...register("remarks")}
                    ></textarea>
                  </div>
                  <p className="text-xs text-red-500 text-right my-3">
                    Required fields are marked with an asterisk{" "}
                    <abbr title="Required field">*</abbr>
                  </p>
                  <div className="mt-5 text-right md:space-x-3 md:block flex flex-col-reverse">
                    <button className="mb-2 md:mb-0 bg-white px-5 py-2 text-[12px] shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100">
                      {" "}
                      Cancel{" "}
                    </button>
                    <button className="mb-2 md:mb-0 bg-green-400 px-5 py-2 text-[12px] shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-green-500">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

       
      </div>
    </main>
          
           </div>
        </div>
      </div>
    </main>
  );
}

export default Userform1;

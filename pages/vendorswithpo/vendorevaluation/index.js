import React from "react";
import Vendorevaluationfixed from "../../../components/Vendordetailed/Vendorevaluationfixed";
// import Vendorevaluationyear2021 from "../../../components/Vendordetailed/Vendorevaluationyear2021";
// import Vendorevaluationyear2022 from "../../../components/Vendordetailed/Vendorevaluationyear2022";
// import Vendorevaluationyear2023 from "../../../components/Vendordetailed/Vendorevaluationyear2023";
import Vendorevaluationyear2024 from "../../../components/Vendordetailed/Vendorevaluationyear2024";
import Vendorcompletecontacts from "../../../components/Vendordetailed/Vendorcontacts";
import Vendormatgroups from "../../../components/Vendordetailed/Vendormatgroups";
// import Navigationcomp from "../../../components/Navigationcomponent";
import HeaderComponent from "../../../components/HeaderComponent";
import Vendorevaluationpastyears from "../../../components/Vendordetailed/vendorevaluationpastyears";
import VendorevalRemarks from "../../../components/Vendordetailed/VendorevalRemarks";
import Vendorfreetext  from "../../../components/Vendordetailed/Vendorfreetext"


import Router, { useRouter } from "next/router";

function Vendorevaluationcomp() {
  const router = useRouter();
  const { vendornumber } = router.query;

  return (
    <div>
      {/* <Navigationcomp /> */}
      < HeaderComponent /> 
      <div className="relative pb-6 mb-3 overflow-hidden rounded-lg shadow-lg cursor-pointer m-4 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
      <img
          className="object-cover w-full h-10"
          src="/images/hardhat.jpg"
          alt="hardhat"
        />
    </div>
      
      <Vendorevaluationfixed vendornumber={vendornumber} />

      {/* <Vendormatgroups vendornumber = {vendornumber} />  */}
      <div className="flex justify-center align-middle ">
        <h4 className="mb-3 py-1 px-16 text-[14px] shadow-lg shadow-slate-200 mx-auto my-auto bg-sky-100/80 text-stone-800 font-bold italic tracking-widest">
          {" "}
          The Variable yearly PO wise parameters for vendor: {vendornumber} for year 2024
        </h4>
      </div>
      {/* <Vendorevaluationyear2021 vendornumber={vendornumber} />
      <Vendorevaluationyear2022 vendornumber={vendornumber} />
      <Vendorevaluationyear2023 vendornumber={vendornumber} /> */}
      <Vendorevaluationyear2024 vendornumber={vendornumber} />
      <Vendorevaluationpastyears vendornumber = {vendornumber} />    
      <VendorevalRemarks vendornumber={vendornumber} /> 

      <Vendorcompletecontacts vendornumber={vendornumber} />
      <Vendorfreetext vendornumber = {vendornumber} />
      
    </div>
  );
}

export default Vendorevaluationcomp;

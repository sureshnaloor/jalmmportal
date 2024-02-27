import React from "react";
import Vendorevaluationfixed from "../../../components/Vendordetailed/Vendorevaluationfixed";
import Vendorevaluationyearwise from "../../../components/Vendordetailed/Vendorevaluationyearwise";
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

      <Vendorevaluationyearwise vendornumber={vendornumber} />
      <Vendorevaluationpastyears vendornumber = {vendornumber} />    
      <VendorevalRemarks vendornumber={vendornumber} /> 

      <Vendorcompletecontacts vendornumber={vendornumber} />
      <Vendorfreetext vendornumber = {vendornumber} />
      
    </div>
  );
}

export default Vendorevaluationcomp;

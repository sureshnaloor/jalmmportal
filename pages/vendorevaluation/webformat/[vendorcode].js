import React from 'react'
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";

function vendorevaluation() {
    const router = useRouter()
    const [evalmarks, setEvalmarks] = useState([])
    let vendorcode = router.query.vendorcode

    useEffect(() => {
      (async () => {
        const result = await fetch(`/api/vendorevaluation`);
        const json = await result.json();
  
        setEvalmarks(json);
      })();
    }, []);
  
    console.log(evalmarks.filter(evalmark => evalmark.vendorcode === vendorcode))
    const vendoreval = evalmarks.filter(evalmark => evalmark.vendorcode === vendorcode)
    console.log(vendoreval)
  return (
    <>
    <div> Evaluation of vendor {vendorcode} </div>
    <h1> Past year scores </h1>
    {vendoreval && vendoreval[0].past.length > 0 ? (
      <div>
        <p> Year {vendoreval[0].past[0].pastyear} <span> {vendoreval[0].past[0].pastyearscore} </span></p>
        <p> Year {vendoreval[0].past[1].pastyear} <span> {vendoreval[0].past[1].pastyearscore} </span></p>
        <p> Year {vendoreval[0].past[2].pastyear} <span> {vendoreval[0].past[2].pastyearscore} </span></p>
        <p> Year {vendoreval[0].past[3].pastyear} <span> {vendoreval[0].past[3].pastyearscore} </span></p>
      </div>
    ) : (
      <div> No scores </div>
    )}
   </>
  )
}

export default vendorevaluation
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
  
    console.log(evalmarks);
  return (
    <>
    <div> Evaluation of vendor {vendorcode} </div>
    </>
  )
}

export default vendorevaluation
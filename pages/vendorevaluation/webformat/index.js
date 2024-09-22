import React from 'react'
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Headercomponent  from "../../../components/HeaderComponent"
import Footercomponent  from "../../../components/FooterComponent"

function vendorevaluation() {
    const router = useRouter()
    const [evalmarks, setEvalmarks] = useState([])
    
    useEffect(() => {
      (async () => {
        const result = await fetch(`/api/vendorevaluation`);
        const json = await result.json();
  
        setEvalmarks(json);
      })();
    }, []);
  
      return (
    <>
    <Headercomponent />
    {JSON.stringify(evalmarks[0])}
  

        <Footercomponent />
   </>
  )
}

export default vendorevaluation
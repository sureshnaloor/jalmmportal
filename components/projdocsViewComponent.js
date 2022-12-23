import React from 'react'
import { useState, useEffect } from "react";

function ProjdocsViewComponent() {
  const [projectdocs, setProjectdocs] = useState([]);
  let wbs = "IS%2FGP.22.002"
  

  useEffect(() => {
    
    const fetchProjectDocs = async () => {
      const response = await fetch(`/api/projects/viewFiles/${wbs}`);
      const json = await response.json();
      setProjectdocs(json);
    };
    fetchProjectDocs();
  }, [wbs]);

  console.log(projectdocs)
  return (
    <>
    <div className='pb-3 font-bold font-Rampart text-xs'>project Docs for {wbs} </div>
    {projectdocs.map((row,index) => (
      <>
      <p key={index} className="font-bold"> {row["email"]}</p>
      <p className='pb-4'>{row["filename"].map((file,index) => (
        <h3 key={index} className="cursor-pointer">
          {file}
        </h3>
      ))}
      </p>
      </>
    ))}
    </>
  )
}

export default ProjdocsViewComponent
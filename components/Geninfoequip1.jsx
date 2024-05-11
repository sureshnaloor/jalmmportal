import React,  from "react";

import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";

function Geninfoform1({ equip }) {

  const router = useRouter() 
  return (
    <main className="w-full min-h-full">
     <h3>
        this is filled in with data for equipment {equip}
      </h3>
    </main>
  );
}

export default Geninfoform1;

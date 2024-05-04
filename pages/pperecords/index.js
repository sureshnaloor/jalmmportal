import React from "react";
import { useForm } from "react-hook-form";
import HeaderComponent from "../../components/HeaderComponent";

import {getSession} from "next-auth/react"

import Rodal from "rodal";
import 'rodal/lib/rodal.css';



function pperecords() {

    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();
    
      const onSubmit = (data) => console.log(data);
    
      const onErrors = (errors) => console.error(errors);
  return (
    <main>
        <HeaderComponent /> 
        <div className="mx-auto w-11/12 grid md:grid-cols-4 md:gap-6 mt-9 pt-1">
            <div className="w-5/6 bg-lime-100 flex align-middle justify-center border-r-2 border-zinc-800">
                <h1> PPE Stock:</h1>
            </div>

            <div className="w-5/6 bg-sky-100 flex align-middle justify-center">
                <h1> PPE consumption (last 12 months):</h1>
            </div>

            <div className="w-5/6 bg-teal-100 flex align-middle justify-center">
                <h1> PPE Issue record for an employee:</h1>
            </div>

            <div className="w-5/6 bg-purple-100 flex align-middle justify-center">
                <h1> <button className="text-xl bg-sky-900 text-white p-1 "> + </button> Issue PPE to employee</h1>
            </div>
            
        </div>
    </main  >
  )
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
  
    if (!session) {
      return {
        redirect: {
          destination: "/auth/login",
          permanent: false,
        },
      };
    }
  
    return {
      props: { session },
    };
  }
  

export default pperecords
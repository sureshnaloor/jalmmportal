import React from "react";
import { useForm } from "react-hook-form";
import HeaderComponent from "../../components/HeaderComponent";

import {getSession} from "next-auth/react"



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
        <div className="w-11/12 bg-stone-100 grid md:grid-cols-3 md:gap-6">
            <div className="w-5/6 bg-sky-100 mx-auto">
                <h1> PPE Stock:</h1>
            </div>

            <div className="w-5/6 bg-sky-100 mx-auto">
                <h1> PPE consumption (last 12 months):</h1>
            </div>

            <div className="w-5/6 bg-sky-100 mx-auto">
                <h1> PPE Issue record for an employee:</h1>
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
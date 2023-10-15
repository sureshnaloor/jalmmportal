import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import {useSession} from 'next-auth/react';
import Image from 'next/image'


function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  const [formErrormsg, setFormerrormsg] = useState(null)
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log({ response });

    setEmail("")
    setPassword("")



    if (!response?.error) {
      router.push("/");
      
    }
    else{
      setFormerrormsg('Invalid credentials! please fill correct email/password')
    }
  };

  if (session) {
    router.push('/')
  }
  return (
    <div className="min-h-full my-20 w-ful p-24">
       <p className="mx-auto w-1/2 py-6 text-2xl uppercase font-bold text-zinc-800">
        
        Welcome to lOGIN page of MM Web portal! 
      </p>
      <div className="grid grid-cols-3">
        <div>
          <Image
          src="/JAL.jpg"
          width={640}
          height={640}          
          priority    
          objectFit="contain"
          alt="sideimage"
          />
        </div>

        <div>
       
      <form
        className="flex flex-col gap-2 mt-3 mx-auto w-96"
        onSubmit={handleSubmit}
      >

        <p className="text-amber-800 text-sm   uppercase font-black mb-12">{formErrormsg}</p>
        <div className="flex justify-around mb-9 ">
          {" "}
          <label htmlFor="email" className="font-bold uppercase">
            {" "}
            E-Mail:{" "}
          </label>{" "}
          <input
            type="email"
            name="email"
            id="'email"
            placeholder="abc.d@jalint.com.sa"
            className="border border-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className="flex justify-around mb-9">
          {" "}
          <label htmlFor="password" className="font-bold uppercase">
            {" "}
            Password{" "}
          </label>{" "}
          <input
            type="password"
            name="password"
            id="email"
            label="password"
            placeholder="****"
            className="border border-green-500"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <button
          type="submit"
          className="bg-sky-500 uppercase font-bold p-3 w-1/4 mx-auto"
        >
          {" "}
          Login
        </button>
      </form>
      </div>
        <div>
            <Image
            src="/MMPortalpic1.jpg"
            alt="portal"
            width={640}
            height={640}
            objectFit="contain"
            />
        </div>
        <div></div>
     
    </div>
    </div>
  );
}

export default Loginpage;

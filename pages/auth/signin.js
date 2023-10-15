import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";


function login() {

  const [userinfo, setUserinfo] = useState({
    email: "",
    user: "",
    password: "",
  });

  const router = useRouter()

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn("credentials",  {
      email: userinfo.email,
      name: userinfo.name,
      password: userinfo.password,
    });
    console.log("clicked");
    console.log(userinfo);

    router.push('/')
  };

  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={userinfo.email}
          onChange={(e) => setUserinfo({ ...userinfo, email: e.target.value })}
          placeholder="sure.n@jalint.com.sa"
        ></input>
        <input
          type="text"
          name="name"
          value={userinfo.name}
          placeholder="sureshnaloor"
          onChange={(e) => setUserinfo({ ...userinfo, name: e.target.value })}
        ></input>
        <input
          type="password"
          name="password"
          value={userinfo.password}
          placeholder="********"
          onChange={(e) =>
            setUserinfo({ ...userinfo, password: e.target.value })
          }
        ></input>
        <button type="Submit"> Signin</button>
      </form>
    </div>
  );
}

export default login;

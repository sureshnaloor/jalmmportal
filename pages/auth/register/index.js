import React, { useState } from "react";

function Registerpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = async (e) => {
    console.log("inside post api click!");

    e.preventDefault();

    const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
        name: username,
        role: role
      }),
      headers: {
        "Content-type": "application/json",
      },
    });
    console.log({ response });
  };
  return (
    <div>
      <p className="mx-auto w-1/4 bg-red-200">
        {" "}
        Welcome to Register page of nextauth credentials of exbeyond
      </p>
      <form
        className="flex flex-col gap-2 mt-3 mx-auto w-96"
        onSubmit={handleSubmit}
      >
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
            placeholder="doe@johncompany.com"
            className="border border-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex justify-around mb-9 ">
          {" "}
          <label htmlFor="username" className="font-bold uppercase">
            {" "}
            Username:{" "}
          </label>{" "}
          <input
            type="text"
            name="username"
            id="'username"
            placeholder="John Doe"
            className="border border-blue-500"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex justify-around mb-9 ">
          {" "}
          <label htmlFor="role" className="font-bold uppercase">
            {" "}
            Role
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="project">Project</option>
            </select>
          </label>{" "}
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
          />
        </div>
        <button
          type="submit"
          className="bg-sky-500 uppercase font-bold p-3 w-1/4 mx-auto"
        >
          {" "}
          Register
        </button>
      </form>
    </div>
  );
}

export default Registerpage;

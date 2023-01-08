import React, { useState } from "react";
import Router from "next/router";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

function ProjdocuploadComponent({ wbs }) {
  const [image, setImage] = useState(null);
  const [imageInput, setImageInput] = useState(null);

  const { data: session } = useSession();

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log("I am clicked");

    const data = new FormData(e.target);

    data.append("projectid", wbs);
    const inputObject = Object.fromEntries(data); // convert the FormData object to a JSON object
    const file = inputObject.upldFiles;

    console.log(file.name)

    setImageInput(inputObject.upldFiles);
    // console.log(imageInput)
    imageInput && data.append("image", imageInput);
    {
      session?.user ? data.append("name", session.user.name) : null;
    }

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      // console.log(e.target.result)
      setImage(e.target.result);
    };
    fileReader.readAsDataURL(file);

    await fetch(`/api/projects/uploadFiles`, {
      method: "POST",
      body: data,
    });

    toast("File is uploaded", {
      hideProgressBar: true,
      autoClose: 2000,
      type: "success",
    });

    e.target.reset();

    Router.reload(window.location.pathname);
    // Router.replace('/projects')
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <div className="inline-block">
          <input name="email" placeholder="email" />
        </div>

        <label
          className="inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          htmlFor="file_input"
        >
          Select file(s)
        </label>
        <input
          className="inline-block w-1/2 text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          aria-describedby="file_input_help"
          id="file_input"
          type="file"
          multiple
          name="upldFiles"
        />
        <p
          className="inline-block mt-1 text-[8px] ml-2  text-gray-500 dark:text-gray-300"
          id="file_input_help"
        >
          PDF,.doc ONLY (MAX.1000 MB).
        </p>

        <div className="flex space-x-2 justify-center">
          <button
            type="submit"
            data-mdb-ripple="true"
            data-mdb-ripple-color="light"
            className="inline-block px-3 py-1 bg-blue-600 text-white font-medium text-xs leading-tight rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            
          >
            Upload
          </button>
        </div>
      </form>

      {/* {image && <Image 
         src={image}
         width={800}
         height={500}
         quality={100}
         priority
         placeholder="blur"
         blurDataURL={image}
         objectFit="contain"
         alt="JAL"
      />} */}
    </div>
  );
}

export default ProjdocuploadComponent;

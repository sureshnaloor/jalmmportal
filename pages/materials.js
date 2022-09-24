import React from "react";
import Image  from "next/image"
import { useState, useEffect } from "react";

function Materials() { 
  const [materials, setmaterials] = useState();

  useEffect(() => {
    const fetchMaterials = async () => {
      const response = await fetch("/api/materials/10100001");
      const json = await response.json();
      setmaterials(json);
    };
    fetchMaterials();
  }, []);

  console.log(materials)

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col">
          <div className="h-1 bg-gray-200 rounded overflow-hidden">
            <div className="w-24 h-full bg-blue-500"></div>
          </div>
          <div className="flex flex-wrap sm:flex-row flex-col py-6 mb-12">
            <h1 className="sm:w-2/5 text-gray-900 font-medium title-font text-2xl mb-2 sm:mb-0">
              {materials["material-description"]}
            </h1>
            <p className="sm:w-3/5 leading-relaxed text-base sm:pl-10 pl-0">
              Street art subway tile salvia four dollar toast bitters selfies
              quinoa yuccie synth meditation iPhone intelligentsia prism tofu.
              Viral gochujang bitters dreamcatcher.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <Image                             
                width='100%' height='100%'
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="https://dummyimage.com/1203x503"
              />
            </div>
            <h2 className="text-xl font-medium title-font text-gray-900 mt-5">
              Shooting Stars
            </h2>
            <p className="text-base leading-relaxed mt-2">
              Swag shoivdigoitch literally meditation subway tile tumblr
              cold-pressed. Gastropub street art beard dreamcatcher neutra,
              ethical XOXO lumbersexual.
            </p>
            <a className="text-blue-500 inline-flex items-center mt-3">
              Learn More
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
            <Image                             
                width='100%' height='100%'
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="https://dummyimage.com/1203x503"
              />
            </div>
            <h2 className="text-xl font-medium title-font text-gray-900 mt-5">
              The Catalyzer
            </h2>
            <p className="text-base leading-relaxed mt-2">
              Swag shoivdigoitch literally meditation subway tile tumblr
              cold-pressed. Gastropub street art beard dreamcatcher neutra,
              ethical XOXO lumbersexual.
            </p>
            <a className="text-blue-500 inline-flex items-center mt-3">
              Learn More
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
            <Image                             
                width='100%' height='100%'
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="https://dummyimage.com/1203x503"
              />
            </div>
            <h2 className="text-xl font-medium title-font text-gray-900 mt-5">
              The 400 Blows
            </h2>
            <p className="text-base leading-relaxed mt-2">
              Swag shoivdigoitch literally meditation subway tile tumblr
              cold-pressed. Gastropub street art beard dreamcatcher neutra,
              ethical XOXO lumbersexual.
            </p>
            <a className="text-blue-500 inline-flex items-center mt-3">
              Learn More
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Materials;

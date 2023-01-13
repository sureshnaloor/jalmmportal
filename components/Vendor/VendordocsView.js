import React, { Suspense } from "react";
import { useState, useEffect } from "react";

// import FileViewer from "react-file-viewer"
const FileViewer = React.lazy(() => import("react-file-viewer"));

function VendordocsViewComponent() {
  const [vendordocs, setVendordocs] = useState([]);

  const [view, setView] = useState(false);

  const handleView = () => {
    setView(!view);
  };

  let vendorid = "10004";

  useEffect(() => {
    const fetchVendorDocs = async () => {
      const response = await fetch(`/api/vendors/viewFiles/${vendorid}`);
      const json = await response.json();
      setVendordocs(json);
    };
    fetchVendorDocs();
  }, [vendorid, view]);

  console.log(vendordocs);

  return (
    <>
      {/* <div className="pb-3 text-sm">
        Vendor Docs for {vendorid}{" "}
      </div> */}
      {vendordocs.map((row, index) => (
        <>
          <p key={index} className=" flex flex-initial">
            {" "}
            {row["crdocument"]}
          </p>
          <p className="pb-4 text-xs">
            {row["filename"].map((file, index) => (
              <>
                <h3 key={index} className="cursor-pointer pb-3 font-semibold">
                  {file}
                </h3>
                <div className="flex flex-row space-x-9">
                <div className="flex space-x-2 justify-center">
                  <button
                    type="button"
                    data-mdb-ripple="true"
                    data-mdb-ripple-color="light"
                    onClick={handleView}
                    className="inline-block px-2 py-1 bg-zinc-100 text-amber-800  text-xs leading-tight font-semibold rounded shadow-md hover:bg-sky-600 hover:shadow-lg focus:bg-sky-600 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-sky-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    View me!
                  </button>
                  <a download href={`/uploads/${file}`}>
                  <button
                      type="button"
                      data-mdb-ripple="true"
                      data-mdb-ripple-color="light"
                      className="px-3 py-1 bg-green-400 text-white font-medium text-xs leading-tight  rounded shadow-md hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out"
                    >
                      Download
                    </button>
                    </a>
                </div>
                
                </div>
                {view && (
                  <Suspense fallback={<div>Loading...</div>}>
                    <FileViewer
                      fileType={file.split(".").pop()}
                      filePath={`/uploads/${file}`}
                    ></FileViewer>
                  </Suspense>
                )}
              </>
            ))}
          </p>
        </>
      ))}
    </>
  );
}

export default VendordocsViewComponent;

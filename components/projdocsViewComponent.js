import React, { Suspense } from "react";
import { useState, useEffect } from "react";

// import FileViewer from "react-file-viewer"
const FileViewer = React.lazy(() => import("react-file-viewer"));

function ProjdocsViewComponent() {
  const [projectdocs, setProjectdocs] = useState([]);

  const [view, setView] = useState(false);

    const handleView = () => {
      setView(!view)
  };

  let wbs = "IS%2FGP.22.001";

  useEffect(() => {
    const fetchProjectDocs = async () => {
      const response = await fetch(`/api/projects/viewFiles/${wbs}`);
      const json = await response.json();
      setProjectdocs(json);
    };
    fetchProjectDocs();
  }, [wbs, view]);

  console.log(projectdocs);

  return (
    <>
      <div className="pb-3 font-bold font-Rampart text-xs">
        project Docs for {wbs}{" "}
      </div>
      {projectdocs.map((row, index) => (
        <>
          <p key={index} className="font-bold">
            {" "}
            {row["email"]}
          </p>
          <p className="pb-4">
            {row["filename"].map((file, index) => (
              <>
                <h3 key={index} className="cursor-pointer">
                  {file}
                </h3>
                <button onClick={handleView}>View</button>
                {view && (
                  <Suspense fallback={<div>Loading...</div>}>
                    <FileViewer fileType={file.slice(-3)} filePath={`/uploads/${file}`} />
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

export default ProjdocsViewComponent;

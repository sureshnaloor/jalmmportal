import React from "react";
// import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

// import moment from 'moment'
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";
import Tablecomponent, {
  SelectColumnFilter,
  Boldstyle1,
  Boldstyle2,
  Boldstyle3,
  Boldstyle4,
  Numberstyle,
  Datestyle,
} from "../../components/Tablecomponent";
import Purchaseorderschedule from "../../components/Purchaseorderschedule";
// import { useSession } from "next-auth/react";

function Projectdetails() {
  const router = useRouter();

  const [selectedProject, setSelectedProject] = useState({});
  // const [editmode, setEditmode] = useState(false);

  function handleEdit(row) {
    const projnumber = row.row.values;
    // setEditmode(true)
    console.log(projnumber);
    // console.log(editmode)
    // setSelectedopenpo({ ...ponumber, "_id.po-number" });
    // setShowModal(true);
    router.push(`/projectdetails/projectsch?projnumber=${projnumber["project-wbs"]}`)
  }

  const columns = useMemo(
    () => [
      // first group - TV Show
      // Header: `List of materials in group ${matgroupid}`,
      // First group columns
      // columns: [
      {
        Header: "Project Number",
        accessor: "project-wbs",
        Cell: Boldstyle3,
        Filter: SelectColumnFilter,
      },
      {
        Header: "Project Name",
        accessor: "project-name",
        Cell: Boldstyle4,
        Filter: SelectColumnFilter,
      },
      {
        Header: "Project Manager",
        accessor: "project-incharge",
        Filter: SelectColumnFilter,

        Cell: Boldstyle3,
      },

      {
        Header: "Project start date",
        accessor: "start-date",

        Cell: Datestyle,
      },

      {
        Header: "Project Finish date",
        accessor: "finished-date",

        Cell: Datestyle,
      },

      {
        Header: "Action",
        accesor: "action",
        Cell: (row) => (
          <div className="bg-blue-500 hover:bg-blue-700 text-white text-[14px] font-bold py-2 px-4 rounded">
            <button onClick={(e) => handleEdit(row)}> Project Schedule </button>
          </div>
        ),
      },
    ],

    // ],
    []
  );

  const [projectlist, setProjectlist] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/projects/projectdetails`);
      const json = await result.json();
      setProjectlist(json);
    })();
  }, []);

  console.log(projectlist);
  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen bg-gray-50 text-gray-900 w-11/12 ml-9">
        <div className="mt-6">
          <p className="font-bold text-lg mb-3">
            List of all open projects 
          </p>
          <Tablecomponent columns={columns} data={projectlist} />
        </div>
      </div>
      <FooterComponent />
    </>
  );
}

export default Projectdetails;

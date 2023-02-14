import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";
import Tablecomponent from "../../components/Tablecomponent";

function Matgroup() {
  const router = useRouter();
  let matgroupid = router.query.matgroupid;
  // console.log(router.query.matgroupid)

  const columns = useMemo(
    () => [
      {
        // first group - TV Show
        Header: "Material Details",
        // First group columns
        columns: [
          {
            Header: "Material Code",
            accessor: "material-code",
          },
          {
            Header: "Material Description",
            accessor: "material-description",
          },
          {
            Header: "Unit of Measure",
            accessor: "unit-measure",
          },

          {
            Header: "Material Industry",
            accessor: "material-industry",
          },
          {
            Header: "Material Type",
            accessor: "material-type",
          },

          {
            Header: "Old Material Number",
            accessor: "old-material-number",
          },
          {
            Header: "Created By",
            accessor: "created-by",
          },
          {
            Header: "Created Date",
            accessor: "created_date",
          },
        ],
      },
    ],
    []
  );

  const [matlist, setMatlist] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/matgroup/materials/${matgroupid}`);
      const json = await result.json();
      setMatlist(json);
    })();
  }, [matgroupid]);

  console.log(matlist);
  return (
    <>
      <HeaderComponent />

      <Tablecomponent columns={columns} data={matlist} />
      <FooterComponent />
    </>
  );
}

export default Matgroup;

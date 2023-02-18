import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
// import moment from 'moment'
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";
import Tablecomponent, {SelectColumnFilter, Mattype, Cellstyle, Datestyle, Boldstyle1, Boldstyle2} from "../../components/Tablecomponent";
import Matedit from '../../components/Mateditcomponent'
function Matgroup() {
  const router = useRouter();
  let matgroupid = router.query.matgroupid;
  // console.log(router.query.matgroupid)

  function handleEdit(row){
    const matcode = row.row.values["material-code"];
    console.log(matcode)
  }

  const columns = useMemo(
    () => [
      
        // first group - TV Show
        // Header: `List of materials in group ${matgroupid}`,
        // First group columns
        // columns: [
          {
            Header: "Material Code",
            accessor: "material-code",
            Cell: Boldstyle1,
            
          },
          {
            Header: "Material Description",
            accessor: "material-description",
            Cell: Boldstyle2,
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
            Cell:Mattype
          },

          {
            Header: "Old Material Number",
            accessor: "old-material-number",
          },
          {
            Header: "User",
            accessor: "created-by", 
            Filter: SelectColumnFilter,  // new
            filter: 'includes',  // new
            Cell: Boldstyle1,
          },
          {
            Header: "Date",
            accessor: "created_date",
            // Filter: SelectColumnFilter,  // new
            // filter: 'includes',  // new
            Cell: Datestyle,            
          },
          {
            Header:'Action',
            accesor:'action',
            Cell: row => (
              <div className="text-red-900 font-bold">
                <button onClick={e=> handleEdit(row)}> Edit </button>
              </div>
            )
          }
          
          
        ],
      
    // ],
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

  // console.log(matlist);
  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen bg-gray-50 text-gray-900 w-11/12 ml-9" >
      
      <div className="mt-6">
        <p className="font-bold text-md mb-3">
        List of materials in group {matgroupid}
        </p>
      <Tablecomponent columns={columns} data={matlist} />
      </div>
      </div>
      <FooterComponent />
    </>
  );
}

export default Matgroup;
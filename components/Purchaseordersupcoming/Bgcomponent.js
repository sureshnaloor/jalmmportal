import React, { useState, useEffect } from "react";

function Bgcomponent() {
  const [poBgexpiry, setPobgexpiry] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/purchaseorders/poschedulefilled`);
      const json = await result.json();
      setPobgexpiry(json);
    })();
  }, []);

  //   console.log(poBgexpiry);
  //   console.log(
  //     poBgexpiry.filter(
  //       (row) =>
  //         new Date(row?.bgdata?.pbgexpirydate).getTime() >=
  //         new Date(new Date()).getTime()
  //     )
  //   );

  return (
    <div className="w-full">
      <table className="w-full">
        <thead >
          <tr >
            <th> PO Number </th>
            <th> BG Value</th>
            <th> BG Date</th>
            <th> BG Expiry date</th>
            <th> Days to expiry</th>
            <th> Type</th>
          </tr>
        </thead>

        <tbody >
          {poBgexpiry
            .filter(
              (row) =>
                row.bgdata?.pbgexpirydate !== "" &&
                row.bgdata.pbgexpirydate !== null
            )
            .map((data) => (
            

              <tr  >
                <td> {data.ponumber}</td>
                <td> {data.bgdata.pbgamount || "100,000"} </td>
                <td> {data.bgdata.pbgactualdate || "24-Nov-23"} </td>
                <td> {data.bgdata.pbgexpirydate || "01-Dec-23"} </td>
                <td> {data.bgdata.bgremarks || "testing"} </td>
                <td> abcdefgh </td>
              </tr>
            ))}
        </tbody>
      </table>

      <table className="w-full">
        <thead>
          <tr>
            <th> PO Number </th>
            <th> BG Value</th>
            <th> BG Date</th>
            <th> BG Expiry date</th>
            <th> Days to expiry</th>
            <th> Type</th>
          </tr>
        </thead>

        <tbody>
          {poBgexpiry
            .filter(
              (row) =>
              new Date(row.bgdata?.pbgexpirydate).getTime() >=
              new Date(new Date()).getTime()
            )
            .map((data) => (
            

              <tr>
                <td> {data.ponumber}</td>
                <td> {data.bgdata.pbgamount} </td>
                <td> {data.bgdata.pbgactualdate} </td>
                <td> {data.bgdata.pbgexpirydate} </td>
                <td> {data.bgdata.bgremarks} </td>
                <td> abcdefgh </td>
              </tr>
            ))}
        </tbody>
      </table>

     
    </div>
  );
}

export default Bgcomponent;

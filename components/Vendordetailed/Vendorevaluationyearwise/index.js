import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";

function Vendorevaluationyearwise({ vendornumber }) {
  const [purchaseorders, setPurchaseorders] = useState([]);
  const [numpo, setNumpo] = useState(0)
  
  const router = useRouter();
  // console.log(vendornumber);

  useEffect(() => {
    const fetchPurchaserorders = async () => {
      const response = await fetch(
        `/api/purchaseorders/vendor/yearwise/${vendornumber}`
      );
      const json = await response.json();
      setPurchaseorders(json);
      setNumpo(Object.keys(json).length);
      
    };
    fetchPurchaserorders();
  }, [vendornumber]);

  // console.log(purchaseorders);
  // console.log(numpo)
  // console.log(numpurchases)

  // useEffect to fetch from already rated vendor here.... if exists then the 'rating' component will be displayed, not the 'table' with buttons

  const [ratingprice, setRatingprice] = useState([])
  const [ratingdely, setRatingdely] = useState([])

  const [ratingquality, setRatingquality] = useState([])

  const [totalscore, setTotalscore] = useState([])

  
 

  return (
    <div className="bg-zinc-100 w-full">
      <div className="mx-auto w-5/6 drop-shadow rounded-md mb-9">
        <h1 className="text-[14px] tracking-wider font-semibold text-center text-black mb-10">
          Evaluation for the highest value PO in 2021 for the vendor code:{" "}
          {vendornumber}
        </h1>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm  text-gray-500 dark:text-gray-400">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 text-center "
                >
                  PO Number
                </th>
                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 "
                >
                  PO Date
                </th>
                {/* <th
                                scope="col"
                                className="text-[12px] font-medium text-gray-900 px-3 py-4 text-center"
                              >
                                Vendor
                              </th> */}
                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 text-right "
                >
                  PO Value
                </th>

                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 "
                >
                  Pending PO Value
                </th>

                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 text-center"
                >
                  Timely delivery
                </th>

                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 text-center "
                >
                  Price competitiveness
                </th>

                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 text-center "
                >
                  Quality of supply
                </th>

                <th
                  scope="col"
                  className="text-[12px] font-medium text-gray-900 px-3 py-4 text-center "
                >
                  PO Score:
                </th>
              </tr>
            </thead>
            <tbody>
              {purchaseorders
                ?.sort((a, b) => b.poval - a.poval)
                .slice(0, numpo > 3 ? 3 : numpo)
                .map((ponum, poindex) => (
                  <tr
                    key={poindex}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td
                      scope="row"
                      className="px-6 py-4 text-[12px] tracking-wider font-black text-gray-900 whitespace-nowrap dark:text-white text-center"
                    >
                      {ponum.ponum}
                    </td>
                    <td className="px-6 py-4">
                      {moment(ponum.podate).format("MM-DD-YYYY")}
                    </td>
                    <td class="px-6 py-4 text-right font-medium">
                      {(Math.round(ponum.poval * 100) / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(
                        Math.round(ponum.balgrval * 100) / 100
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        {[...Array(5)].map((star, index) => {
                          index += 1;
                          return (
                            <button
                              type="button"
                              key={index}
                              disabled={ratingdely[poindex]}
                              className={
                                index <= ratingdely[poindex]
                                  ? "text-red-900"
                                  : "text-gray-300 "
                              }
                              onClick={() => {
                                console.log(poindex, index);
                                setRatingdely(ratingdely => [...ratingdely, index])
                                // setTotalscore(Number(ratingdely[poindex]) + Number(ratingprice[poindex]) + Number(ratingquality[poindex]))
                                // console.log(ratingdely)
                                
                              }
                              }
                            >
                              <span>&#9733;</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div>
                        {[...Array(5)].map((star, index) => {
                          index += 1;
                          return (
                            <button
                              type="button"
                              key={index}
                              disabled={ratingprice[poindex]}
                              className={
                                index <= ratingprice[poindex]
                                  ? "text-red-900"
                                  : "text-gray-300 "
                              }
                              onClick={() => {
                                setRatingprice(ratingprice => [...ratingprice, index])
                                // setTotalscore(Number(ratingdely[poindex]) + Number(ratingprice[poindex]) + Number(ratingquality[poindex]))
                                }}
                            >
                              <span>&#9733;</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        {[...Array(5)].map((star, index) => {
                          index += 1;
                          return (
                            <button
                              type="button"
                              key={index}
                              disabled={ratingquality[poindex]}
                              className={
                                index <= ratingquality[poindex]
                                  ? "text-red-900"
                                  : "text-gray-300 "
                              }
                              onClick={() => {
                                setRatingquality(ratingquality => [...ratingquality, index])
                                // setTotalscore(Number(ratingdely[poindex]) + Number(ratingprice[poindex]) + Number(ratingquality[poindex]))
                              }
                              }
                            >
                              <span>&#9733;</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div>{isNaN(Number(ratingdely[poindex])+ Number(ratingprice[poindex])+ Number(ratingquality[poindex])) ? null : 
                      (Number(ratingdely[poindex])+ Number(ratingprice[poindex])+ Number(ratingquality[poindex])) }</div>

                      
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Vendorevaluationyearwise;

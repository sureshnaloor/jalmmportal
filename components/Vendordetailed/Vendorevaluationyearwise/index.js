import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { useSession } from "next-auth/react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Vendorevaluationyearwise({ vendornumber }) {
  const [purchaseorders, setPurchaseorders] = useState([]);
  const [numpo, setNumpo] = useState(0);

  const router = useRouter();
  // console.log(vendornumber);

  const { data: session } = useSession();

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

  useEffect(() => {
    const fetchPOEvaluated = async () => {
      const response = await fetch(
        `/api/vendors/vendorevalyearly/${vendornumber}`
      );
      const json = await response.json();
      setVendorevaled(json);
    };
    fetchPOEvaluated();
  }, [vendornumber]);

  // console.log(purchaseorders);
  // console.log(numpo)
  // console.log(numpurchases)

  // useEffect to fetch from already rated vendor here.... if exists then the 'rating' component will be displayed, not the 'table' with buttons

  const [ratingprice, setRatingprice] = useState([]);
  const [ratingdely, setRatingdely] = useState([]);
  const [ratingquality, setRatingquality] = useState([]);

  const [powiserating, setPowiserating] = useState([]);

  const [totalscore, setTotalscore] = useState([]);

  const [vendorevaled, setVendorevaled] = useState({});

  return (
    <div className="bg-zinc-100 mx-auto w-5/6 drop-shadow rounded-md mb-9">
      
      <h4 className="mb-3 py-3 shadow-lg shadow-slate-200 mx-auto my-auto bg-sky-900 text-white font-bold font-italic tracking-widest">
        {" "}
        The Variable yearly PO wise parameters:{" "}
      </h4>
      
      <div className="mx-auto drop-shadow rounded-md mb-9">
        
        <h1 className="text-[14px] tracking-wider font-semibold text-center py-3  text-black mb-10 italic bg-slate-400">
          Evaluation for the highest value PO in 2021 for the vendor code:{" "}
          {vendornumber}
        </h1>

        {vendorevaled["powiseevalyear1"] ? (
          <div className="grid grid-cols-5 gap-3 bg-sky-900">
          
            <h3 className="bg-slate-100 grid-span-1 px-6 pt-16 text-slate-900 shadow-md mr-3 shadow-zinc-500" >
              {" "}
              <span  className="font-bold tracking-wide">Yearly PO wise evaluation </span>  <br /> result for the vendor <br /> <span  className="font-bold tracking-wide">{vendornumber}</span>
            </h3>
            <div className="col-start-2 col-end-6 bg-sky-100 grid border-r-4 border-slate-500">
              <div className="grid grid-cols-2 mb-10"> 
              <div>
                <h4 className="font-bold text-zinc-900 mb-3">
                {" "}
                PO number: <span className="text-amber-900 bg-zinc-50 px-3 shadow-lg shadow-zinc-300"> {vendorevaled["powiseevalyear1"]["powiserating"][0].ponumber} </span>
                
              
                </h4>
              <p className="text-sky-900 font-bold pb-9 "> PO Value: <span className="px-3 shadow-lg shadow-zinc-300 bg-zinc-50"> {vendorevaled["powiseevalyear1"]["powiserating"][0].povalue}</span></p>
             <div className="grid grid-cols-5"> <p className=" col-span-4 font-Lato font-black italic mb-3 "> Delivery rating:</p> <h5 className=" col-span-1 ml-9 font-bold px-3 text-slate-800 bg-sky-100 shadow-lg shadow-sky-800 mr-3 mb-1"> {vendorevaled["powiseevalyear1"]["powiserating"][0].deliveryrating}</h5>  </div>
             <div className="grid grid-cols-5"> <p className=" col-span-4 font-Lato font-black italic mb-3 "> Price competitiveness  rating: </p><h5 className="col-span-1 ml-9 font-bold px-3 text-slate-800 bg-sky-100 shadow-lg shadow-sky-800 mr-3 mb-1"> {vendorevaled["powiseevalyear1"]["powiserating"][0].pricerating} </h5> </div>
             <div className="grid grid-cols-5"> <p className=" col-span-4 font-Lato font-black italic mb-3 "> Quality rating:</p> <h5 className="col-span-1 ml-9 font-bold px-3 text-slate-800 bg-sky-100 shadow-lg shadow-sky-800 mr-3 mb-1">{vendorevaled["powiseevalyear1"]["powiserating"][0].qualityrating} </h5> </div>
              </div>

              { vendorevaled["powiseevalyear1"]["powiserating"][1] ? (
                <div>
                <>
                 <h4 className="font-bold text-zinc-900 mb-3">
                 {" "}
                 PO number: <span className="text-amber-900 bg-zinc-50 px-3 shadow-lg shadow-zinc-300"> {vendorevaled["powiseevalyear1"]["powiserating"][1].ponumber} </span>
                 
               
               </h4>
               <p className="text-sky-900 font-bold pb-9"> PO Value: <span className="px-3 shadow-lg shadow-zinc-300 bg-zinc-50"> {vendorevaled["powiseevalyear1"]["powiserating"][1].povalue} </span></p>
               <div className="grid grid-cols-5"><p className="col-span-4 font-Lato font-black italic mb-3"> Delivery rating:  </p> <h5 className="col-span-1 ml-9 font-bold px-3 text-slate-800 bg-sky-100 shadow-lg shadow-sky-800 mr-3 mb-1">{vendorevaled["powiseevalyear1"]["powiserating"][1].deliveryrating} </h5> </div>
               <div className="grid grid-cols-5"><p className="col-span-4 font-Lato font-black italic mb-3"> Price competitiveness  rating: </p> <h5 className="col-span-1 ml-9 font-bold px-3 text-slate-800 bg-sky-100 shadow-lg shadow-sky-800 mr-3 mb-1">{vendorevaled["powiseevalyear1"]["powiserating"][1].pricerating} </h5> </div>
               <div className="grid grid-cols-5"><p className="col-span-4 font-Lato font-black italic mb-3"> Quality rating: </p><h5 className="col-span-1 ml-9 font-bold px-3 text-slate-800 bg-sky-100 shadow-lg shadow-sky-800 mr-3 mb-1">{vendorevaled["powiseevalyear1"]["powiserating"][1].qualityrating}</h5> </div>
               </>
               </div>
              ) : (null)}
              </div>
          </div>
          </div>

          
        ) :
        
        (
          <>
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
                          {(
                            Math.round(ponum.poval * 100) / 100
                          ).toLocaleString()}
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
                                    setRatingdely((ratingdely) => [
                                      ...ratingdely,
                                      index,
                                    ]);
                                    // setTotalscore(Number(ratingdely[poindex]) + Number(ratingprice[poindex]) + Number(ratingquality[poindex]))
                                    // console.log(ratingdely)
                                  }}
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
                                    setRatingprice((ratingprice) => [
                                      ...ratingprice,
                                      index,
                                    ]);
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
                                    setRatingquality((ratingquality) => [
                                      ...ratingquality,
                                      index,
                                    ]);
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
                            {isNaN(
                              Number(ratingdely[poindex]) +
                                Number(ratingprice[poindex]) +
                                Number(ratingquality[poindex])
                            )
                              ? null
                              : Number(ratingdely[poindex]) +
                                Number(ratingprice[poindex]) +
                                Number(ratingquality[poindex])}
                          </div>
                        </td>
                        <td
                          onClick={() => {
                            setPowiserating((powiserating) => [
                              ...powiserating,
                              {
                                ponumber: ponum.ponum,
                                povalue: (
                                  Math.round(ponum.poval * 100) / 100
                                ).toLocaleString(),
                                deliveryrating: Number(ratingdely[poindex]),
                                qualityrating: Number(ratingquality[poindex]),
                                pricerating: Number(ratingprice[poindex]),
                                porating:
                                  Number(ratingdely[poindex]) +
                                  Number(ratingprice[poindex]) +
                                  Number(ratingquality[poindex]),
                              },
                            ]);
                            toast.success(
                              `The PO rating ${ponum.ponum} for the vendor ${vendornumber} is added! thanks ${session?.user?.name}`,
                              {
                                position: "bottom-center",
                              }
                            );
                          }}
                        >
                          <button className="bg-sky-900 text-white p-2 text-xs">
                            {" "}
                            save{" "}
                          </button>{" "}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div>
              {purchaseorders.length > 0 ? (
                <div className="bg-sky-800 text-gray-100 p-2 text-sm ">
                  {" "}
                  <span
                    onClick={async () => {
                      let body;

                      body = {
                        powiserating,
                        createdBy: session?.user?.name,
                        createdAt: new Date(),
                      };

                      await fetch(
                        `/api/vendors/vendorevalyearly/${vendornumber}`,
                        {
                          method: "PUT",
                          body: JSON.stringify(body),
                          headers: new Headers({
                            "Content-Type": "application/json",
                            Accept: "application/json",
                          }),
                        }
                      );

                      // console.log(powiserating)
                      toast.success(
                        `The PO-wise rating for the year 2021 for the vendor ${vendornumber} is completed, thanks!`,
                        {
                          position: toast.POSITION.TOP_RIGHT,
                        }
                      );
                      router.reload();
                    }}
                  >
                    <button
                      type="button"
                      class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-[12px] px-3 py-1 text-center mr-2 mb-2"
                    >
                      Finalize
                    </button>
                  </span>{" "}
                  <span className=" ml-72 bg-zinc-100 text-zinc-900 py-1 px-3">
                    {" "}
                    Total Year-wise Score:
                  </span>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Vendorevaluationyearwise;

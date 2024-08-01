import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { useSession } from "next-auth/react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Vendorevaluationyear2021({ vendornumber }) {
  const [purchaseorders, setPurchaseorders] = useState([]);
  const [numpo, setNumpo] = useState(0);

  const router = useRouter();
  // console.log(vendornumber);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchPurchaserorders = async () => {
      const response = await fetch(
        `/api/purchaseorders/vendor/yearwise2021/${vendornumber}`
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
        `/api/vendors/vendorevalyearly1/${vendornumber}`
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

    <div className="bg-zinc-100 mx-auto w-5/6 drop-shadow rounded-md mb-9 shadow-md shadow-stone-500">
      

      <div className="mx-auto drop-shadow rounded-md mb-9">
        <h1 className="text-[14px] tracking-wider w-1/5 mx-auto font-semibold text-center py-1  text-black mb-3 italic bg-zinc-100 shadow-md shadow-zinc-800">
          Year 2021
        </h1>
        <div>
       
        {purchaseorders.length > 0 && vendorevaled["powiseevalyear1"] ? (
          // if already evaluated, get the scores

          // parent flex div
          <div className="flex justify-between">
            {/* 1st child */}
            <h3 className="bg-slate-100 px-6 pt-16 text-slate-900 shadow-md mr-3 shadow-zinc-500">
              {" "}
              <span className="font-bold text-[12px] font-Lato tracking-wide">
                2021 Year PO wise evaluation{" "}
              </span>{" "}
              <br /> result for the vendor <br />{" "}
              <span className="font-bold tracking-wide">{vendornumber}</span>
            </h3>

            {/* 2nd child */}
            <div className="flex justify-between bg-sky-300 text-[13px] ">
              {/* first PO */}
              <div className="bg-zinc-50/90 flex flex-col mr-2 px-1 shadow-md shadow-zinc-00">
              <>
                    <div className="flex justify-between">
                      <h4 className="font-bold text-zinc-900 mb-3">
                        {" "}
                        PO number:{" "}
                        
                      </h4>
                      <h5 className="text-amber-900 font-bold tracking-wider">
                          {" "}
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][0]?.ponumber
                              
                          }{" "}
                        </h5>
                        </div>

                        <div className="flex justify-between">
                      <p className="text-sky-900 font-bold pb-9">
                        {" "}
                        PO Value:{" "}
                        
                      </p>
                      <h4 className="px-3 font-bold tracking-wider font-Lato">
                          {" "}
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][0]?.povalue
                              
                          }{" "}
                        </h4>
                        </div>
                      <div className="flex justify-between font-mono text-[14px]">
                        <p className="font-black italic mb-3">
                          {" "}
                          Delivery rating:{" "}
                        </p>{" "}
                        <h5 className=" ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][0]?.deliveryrating
                              
                          }{" "}
                        </h5>{" "}
                      </div>
                      <div className="flex justify-between font-mono text-[14px]">
                        <p className="font-black italic mb-3">
                          {" "}
                          Price competitiveness rating:{" "}
                        </p>{" "}
                        <h5 className="ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][0]?.pricerating
                              
                          }{" "}
                        </h5>{" "}
                      </div>
                      <div className="flex justify-between font-mono text-[14px]">
                        <p className="font-black italic mb-3">
                          {" "}
                          Quality rating:{" "}
                        </p>
                        <h5 className="ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][0]?.qualityrating
                              
                          }
                        </h5>{" "}
                      </div>
                    </>
              </div>
              {/* second PO */}

              <div className="bg-zinc-50/90 flex flex-col mr-2 px-1 shadow-md shadow-zinc-300">
                {vendorevaled["powiseevalyear1"]["powiserating"][1] ? (
                  <div>
                    <>
                    <div className="flex justify-between">
                      <h4 className="font-bold text-zinc-900 mb-3">
                        {" "}
                        PO number:{" "}
                        
                      </h4>
                      <h5 className="text-amber-900 font-bold tracking-wider">
                          {" "}
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][1]
                              .ponumber
                          }{" "}
                        </h5>
                        </div>

                        <div className="flex justify-between">
                      <p className="text-sky-900 font-bold pb-9">
                        {" "}
                        PO Value:{" "}
                        
                      </p>
                      <h4 className="px-3 font-bold tracking-wider font-Lato">
                          {" "}
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][1]
                              .povalue
                          }{" "}
                        </h4>
                        </div>
                      <div className="flex justify-between font-mono text-[14px]">
                        <p className="font-black italic mb-3">
                          {" "}
                          Delivery rating:{" "}
                        </p>{" "}
                        <h5 className=" ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][1]
                              .deliveryrating
                          }{" "}
                        </h5>{" "}
                      </div>
                      <div className="flex justify-between text-[14px] font-mono">
                        <p className="font-black italic mb-3">
                          {" "}
                          Price competitiveness rating:{" "}
                        </p>{" "}
                        <h5 className="ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][1]
                              .pricerating
                          }{" "}
                        </h5>{" "}
                      </div>
                      <div className="flex justify-between  text-[14px] font-mono">
                        <p className="font-black italic mb-3">
                          {" "}
                          Quality rating:{" "}
                        </p>
                        <h5 className="ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][1]
                              .qualityrating
                          }
                        </h5>{" "}
                      </div>
                    </>
                  </div>
                ) : null}
              </div>

              {/* third PO */}
              <div className="bg-zinc-50/90 flex flex-col mr-2 px-1 shadow-md shadow-zinc-300">
                {vendorevaled["powiseevalyear1"]["powiserating"][2] ? (
                  <div>
                    <>
                    <div className="flex justify-between">
                      <h4 className="font-bold text-zinc-900 mb-3">
                        {" "}
                        PO number:{" "}
                        
                      </h4>
                      <h5 className="text-amber-900 font-bold tracking-wider">
                          {" "}
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][2]
                              .ponumber
                          }{" "}
                        </h5>
                        </div>

                        <div className="flex justify-between">
                      <p className="text-sky-900 font-bold pb-9">
                        {" "}
                        PO Value:{" "}
                        
                      </p>
                      <h4 className="px-3 font-bold tracking-wider font-Lato">
                          {" "}
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][2]
                              .povalue
                          }{" "}
                        </h4>
                        </div>
                      <div className="flex justify-between font-mono text-[14px]">
                        <p className="font-black italic mb-3">
                          {" "}
                          Delivery rating:{" "}
                        </p>{" "}
                        <h5 className=" ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][2]
                              .deliveryrating
                          }{" "}
                        </h5>{" "}
                      </div>
                      <div className="flex justify-between font-mono text-[14px]">
                        <p className="font-black italic mb-3">
                          {" "}
                          Price competitiveness rating:{" "}
                        </p>{" "}
                        <h5 className="ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][2]
                              .pricerating
                          }{" "}
                        </h5>{" "}
                      </div>
                      <div className="flex justify-between font-mono text-[14px]">
                        <p className="font-black italic mb-3">
                          {" "}
                          Quality rating:{" "}
                        </p>
                        <h5 className="ml-9 font-bold px-3 text-slate-800  mr-3 mb-1">
                          {
                            vendorevaled["powiseevalyear1"]["powiserating"][2]
                              .qualityrating
                          }
                        </h5>{" "}
                      </div>
                    </>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (purchaseorders.length > 0 && !vendorevaled["powiseevalyear1"] ?
          // if not evaluated already, evaluate now
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
                        <td className="px-6 py-4 text-right font-medium">
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
                        <td className="px-6 py-4 text-right">
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
                <div className="bg-sky-200/90 text-gray-100 p-2 text-sm mx-5 mt-2 ">
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
                        `/api/vendors/vendorevalyearly1/${vendornumber}`,
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
                      className=" ml-2 text-white uppercase font-bold  bg-gradient-to-r from-red-300 via-red-300 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 rounded-lg text-[12px] px-3 py-1 text-center mr-2 mb-2"
                    >
                      Finalize
                    </button>
                  </span>{" "}
                  <span className=" ml-[800px] bg-zinc-100 text-[12px] uppercase font-bold text-zinc-900 py-1 px-3 rounded-md">
                    {" "}
                    Total Year-wise Score for year 2021:
                  </span>
                </div>
              ) : null}
            </div>
          </>
          : (
            <p className="text-[12px] uppercase p-3 font-Lato mx-auto"> No Purchases in year 2021.</p>
          )
        )}
      </div>
      </div>
    </div>
  );
}

export default Vendorevaluationyear2021;

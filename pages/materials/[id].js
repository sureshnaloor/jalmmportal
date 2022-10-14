import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from 'next/router';

function Materials() {
  const [materials, setmaterials] = useState({});
  const [purchases, setPurchases] = useState([]);
  const [completestock, setCompletestock] = useState({})
  const [specialStock, setSpecialstock] = useState([])

  // let materialcode = "10200562"
  const router = useRouter();
  let materialcode = router.query.id
  console.log(materialcode)

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch(`/api/materials/${materialcode}`);
        const json = await response.json();
        setmaterials(json);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMaterials();
  }, [materialcode]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const response = await fetch(`/api/purchaseorders/${materialcode}`);
      const json = await response.json();
      setPurchases(json);
    };
    fetchPurchases();
  }, [materialcode]);

  useEffect(() => {
        const fetchSpecialStock = async () => {
      const response = await fetch(`/api/specialstock/${materialcode}`);
      const json = await response.json();
      setSpecialstock(json);
    };
        fetchSpecialStock();
  }, [materialcode]);

  useEffect(() => {
    const fetchCompleteStock = async () => {
      try {
        const response = await fetch(`/api/completestock/${materialcode}`);
        const json = await response.json();
        setCompletestock(json);
      } catch (error) {
        console.log(error)
      }
 
};
    fetchCompleteStock();
}, [materialcode]);

  console.log(materials);
  console.log(purchases);
  console.log(completestock)
  console.log(specialStock)
  
  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col border-b  border-slate-600 shadow-outer  my-4 bg-gradient-to-r from-cyan-100 to-amber-100">
          <div className="h-1 bg-gray-200 rounded overflow-hidden">
            <div className="w-24 h-full bg-blue-500"></div>
          </div>
          <div className="flex flex-nowrap sm:flex-row flex-col py-2 mb-1">
            <h1 className="sm:w-2/6 text-gray-900 font-medium title-font text-xl mb-2 sm:mb-0">
              {materials["material-description"]}
            </h1>
            <h2 className="sm:w-1/6 text-amber-900 text-lg font-bold mb-2 sm:mb-0">
              {" "}
              {materials["unit-measure"]}{" "}
            </h2>
            <h5 className="sm:w-1/6 text-gray-900 text-lg font-semibold italic">
              {" "}
              {materials["material-type"] == "ZCVL" ? "Civil Material" : null}
            </h5>
            <p className="sm:w-2/6 leading-relaxed text-base text-pink-800 font-semibold sm:pl-10 pl-0">
              this is long text describing the material in more detail.
              Currently the material master is not maintaining the view of the
              material text, so a dummy long text is used as boilerplate
              template.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4">
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <Image
                width="100%"
                height="100%"
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/images/purchaseorder.jpg"
              />
            </div>
            <h2 className="text-md font-medium title-font text-gray-900 mt-5 flex align-middle justify-center">
              {/* Purchase Orders for {materials["material-code"]} */}
              purchase order
            </h2>
            <div className="p-3 w-full max-w-md bg-white rounded-lg border shadow-md sm:p-2 dark:bg-gray-800 dark:border-gray-700">
              <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="py-3 px-1">
                        PO Number
                      </th>
                      <th scope="col" className="py-3 px-1 text-red-800">
                        Currency
                      </th>
                      <th scope="col" className="py-3 px-1 text-teal-800">
                        Unit Price
                      </th>
                      <th scope="col" className="py-3 px-1">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 ? "bg-red-50" : null
                        } border-b dark:bg-gray-900 dark:border-gray-700`}
                      >
                        <th
                          scope="row"
                          className="flex flex-col py-4 px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          <p className="text-[10px] text-blue-900">
                            {purchase["po-number"]}
                          </p>
                          <p className="text-[10px] text-purple-700">
                            {moment(purchase["po-date"]).format("MM-DD-YYYY")}
                          </p>
                          <p className="text-[8px] text-teal-700">
                            {purchase["vendorname"]}
                          </p>
                        </th>
                        <td className="py-4 px-1 text-red-400 text-xs">
                          {" "}
                          {purchase["currency"]}
                        </td>
                        <td className="py-4 px-1 text-teal-900 font-bold text-xs">
                          {purchase["po-unit-price"]}
                        </td>
                        <td className="py-4 px-1">
                          {" "}
                          {Math.round(
                            purchase["po-quantity"].$numberDecimal,
                            0
                          )}{" "}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-sm h-64 overflow-hidden">
              <Image
                width="100%"
                height="100%"
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/images/projects.jpg"
              />
            </div>
            <h2 className="text-md font-medium title-font text-gray-900 mt-5 flex align-middle justify-center">
              Account assignments for{" "}
              {/* {materials["material-code"]} */}
            </h2>
            <div className="p-3 w-full max-w-md bg-white rounded-lg border shadow-md sm:p-2 dark:bg-gray-800 dark:border-gray-700">
              <div>
                {Object.entries(
                  purchases.reduce(
                    (next, purchase) => (
                      purchase.account["order"]
                        ? (next[purchase.account["order"]] =
                            ++next[purchase.account["order"]] || 1)
                        : purchase.account["wbs"]
                        ? (next[purchase.account["wbs"]] =
                            ++next[purchase.account["wbs"]] || 1)
                        : purchase.account["costcenter"]
                        ? (next[purchase.account["costcenter"]] =
                            ++next[purchase.account["costcenter"]] || 1)
                        : null,
                      next
                    ),
                    {}
                  )
                ).map((row, index) => (
                  <p key={index} className="pb-3">
                    {" "}
                    <span className="text-red-400 font-semibold text-sm">
                      {" "}
                       {row[1]} {row[1] == 1 ? 'time\u00a0' : 'times'}
                    </span>{" "}
                    <span className="text-purple-900  text-sm"> for {row[0]}</span>{" "}
                  </p>
                ))}
              </div>
              <p className="text-sm leading-relaxed mt-2 font-bold">
                <span className="word-break pt-3 pb-3 text-amber-800 uppercase text-xs"> Total value of this material purchased: </span>
              {purchases.reduce(
                (acc, purchase) => acc + purchase["po-value-sar"],
                0.0
              ).toLocaleString('en-US')}
              <span> {purchases[0]?.currency} </span>
            </p>

            <p className="text-sm leading-relaxed mt-2 font-bold">
                <span className="word-break pt-3 pb-3 text-amber-800 uppercase text-xs"> Total QUANTITY of this material purchased: </span>
              {purchases.reduce(
                (acc, purchase) => acc + Number(purchase["po-quantity"].$numberDecimal),
                0
              ) }
              {/* <span> {materials["unit-measure"]}</span> */}
            </p>
            </div>
          </div>
          <div className="p-4 md:w-1/3 sm:mb-0 mb-6">
            <div className="rounded-lg h-64 overflow-hidden">
              <Image
                width="100%"
                height="100%"
                objectFit="contain"
                layout="responsive"
                alt="content"
                className="object-cover object-center h-full w-full"
                src="/images/suppliers.jpg"
              />
            </div>
            <h2 className="text-md font-medium title-font text-gray-900 mt-5 flex align-middle justify-center">
              Vendors  for{" "}
              {/* {materials["material-code"]} */}
            </h2>
            <div className="p-3 w-full max-w-md bg-white rounded-lg border shadow-md sm:p-2 dark:bg-gray-800 dark:border-gray-700">
              {Object.entries(
                purchases.reduce(
                  (next, purchase) => (
                    (next[purchase.vendorname] =
                      ++next[purchase.vendorname] || 1),
                    next
                  ),
                  {}
                )
              ).map((row, index) => (
                <p key={index}>
                  {" "}
                  <span className="text-red-400">{row[1]} {row[1]==1 ? `time\u00a0 from`:"times from"}  </span>{" "}
                  <span className="text-sm font-semibold">{row[0]}</span>{" "}
                </p>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}

export default Materials;

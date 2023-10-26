import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

import HeaderComponent from "../../components/HeaderComponent";

import Matdocument from "./Matdocument";

function Matdocs() {
  const { ref, inView } = useInView();
  const LIMIT = 100;

  const fetchMatdocs = async (page) => {
    const response = await fetch(
      `/api/materialdocuments?limit=${LIMIT}&page=${page}`
    );
    const json = response.json();
    return json;
  };

  const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ["matdocs"],
      ({ pageParam = 1 }) => fetchMatdocs(pageParam),
      {
        getNextPageParam: (lastPage, allPages) => {
          const nextPage =
            lastPage.length === LIMIT ? allPages.length + 1 : undefined;
          return nextPage;
        },
      }
    );

    useEffect(() => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    }, [inView, fetchNextPage, hasNextPage]);


  console.log(data);

  const content =
    isSuccess &&
    data.pages.map((page, i) =>
      page.map((matdoc, i) => {
        if (page.length === i + 1) {
          return <Matdocument ref={ref} key={matdoc._id} matdoc={matdoc} />;
        }
        return <Matdocument key={matdoc._id} matdoc={matdoc} />;
      })
    );

  return (
    <div className="w-screen">

<HeaderComponent />
<p className="w-full font-bold text-lg ml-32  py-2 bg-purple-50">
            List of all Material documents
          </p>
      
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ">
            <tr className="grid grid-cols-12">
              <th scope="col" className="px-6 py-3 col-span-1">
                Doc number# 
              </th>
              <th scope="col" className="px-6 py-3 col-span-1">
                Item number#
              </th>
              <th scope="col" className="px-6 py-3 col-span-1">
                Doc Date
              </th>
              <th scope="col" className="px-6 py-3 col-span-3">
                Material text
              </th>
              <th scope="col" className="px-6 py-3 col-span-1">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 col-span-1 ">
                Amount (SAR)
              </th>
              <th scope="col" className="px-6 py-3 col-span-2 flex justify-evenly">
                
                <span className="px-1">
                Plant
                </span>
                <span className="px-1">
                SLoc
               </span>
                <span className="px-1">
                Mvt Type
                </span>
                
              </th>
              <th scope="col" className="px-6 py-3 col-span-1">
                Account
              </th>
            </tr>
          </thead>
          <tbody>{content}</tbody>
        </table>
      

      {isFetchingNextPage && <h3>Loading...</h3>}
    </div>
  );

  // return (
  //   <div className="bg-stone-50">
  //     <div className="relative overflow-x-auto">
  //       <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
  //         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
  //           <tr>
  //             <th scope="col" className="px-6 py-3">
  //               Doc number# || serial
  //             </th>
  //             <th scope="col" className="px-6 py-3">
  //               Doc Date
  //             </th>
  //             <th scope="col" className="px-6 py-3">
  //               Material text
  //             </th>
  //             <th scope="col" className="px-6 py-3">
  //               Quantity
  //             </th>
  //             <th scope="col" className="px-6 py-3">
  //               Amount (SAR)
  //             </th>
  //             <th scope="col" className="px-6 py-3">
  //               Plant || Sloc || Mvt
  //             </th>
  //             <th scope="col" className="px-6 py-3">
  //               Account
  //             </th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {isSuccess &&
  //             data.pages.map((page) =>
  //               page.map((matdoc, i) => (
  //                 <tr
  //                   className="bg-white border-b dark:bg-gray-800 text-[12px] dark:border-gray-700"
  //                   ref={ref}
  //                   key={matdoc._id}
  //                 >
  //                   <th
  //                     scope="row"
  //                     class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
  //                   >
  //                     {matdoc["doc-number"]} || {matdoc["doc-item"]}
  //                   </th>
  //                   <td className="px-6 py-2 font-medium text-stone-800">
  //                     {moment(matdoc["doc-date"]).format("MM-DD-YYYY")}
  //                   </td>
  //                   <td className="px-6 py-2 font-medium text-stone-800">
  //                     {matdoc["material-text"]}
  //                   </td>
  //                   <td className="px-6 py-2 font-medium text-stone-800">
  //                     {matdoc["doc-qty"].$numberDecimal}
  //                   </td>
  //                   <td className="px-6 py-2 font-medium text-stone-800">
  //                     {matdoc["doc-amount"]}
  //                   </td>

  //                   <td>
  //                     {matdoc["plant-code"]} || {matdoc.sloc} ||{" "}
  //                     {matdoc["mvt-type"]}
  //                   </td>
  //                   <td>{matdoc["account"]?.network}</td>
  //                 </tr>
  //               ))
  //             )}
  //         </tbody>
  //       </table>
  //     </div>
  //   </div>
  // );
}

export default Matdocs;

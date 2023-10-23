import {  useInfiniteQuery } from "@tanstack/react-query";
import  moment  from "moment";



function Matdocs() {
  const LIMIT=100

  const fetchMatdocs = async (page) => {    
    
    const response = await fetch(
      `/api/materialdocuments?limit=${LIMIT}&page=${page}`
    );
    const json = response.json();
    return json;
    }

  
  const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(["matdocs"], ({ pageParam = 1 }) => fetchMatdocs(pageParam), {
      getNextPageParam: (lastPage, allPages) => {
        const nextPage =
          lastPage.length === LIMIT ? allPages.length + 1 : undefined;
        return nextPage;
      },
    });

  console.log(data);

  return <div>
    
            
<div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Doc number# || serial 
                </th>
                <th scope="col" class="px-6 py-3">
                    Doc Date
                </th>
                <th scope="col" class="px-6 py-3">
                    Material text
                </th>
                <th scope="col" class="px-6 py-3">
                    Quantity
                </th>
                <th scope="col" class="px-6 py-3">
                    Amount (SAR)
                </th>
                <th scope="col" class="px-6 py-3">
                    Plant || Sloc || Mvt 
                </th>
                <th scope="col" class="px-6 py-3">
                    Account
                </th>
            </tr>
        </thead>
        <tbody>
        {isSuccess &&
        data.pages.map((page) =>
          page.map((matdoc, i) => (
            <tr className="bg-white border-b dark:bg-gray-800 text-[12px] dark:border-gray-700">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                   {matdoc["doc-number"]} || {matdoc["doc-item"]}
                </th>
                <td className="px-6 py-2 font-medium text-stone-800">
                {moment(matdoc["doc-date"]).format("MM-DD-YYYY")}
                </td>
                <td className="px-6 py-2 font-medium text-stone-800">
                    {matdoc["material-text"]}
                </td>
                <td className="px-6 py-2 font-medium text-stone-800">
                    {matdoc["doc-qty"].$numberDecimal}
                </td>
                <td className="px-6 py-2 font-medium text-stone-800">
                    {matdoc["doc-amount"]}
                </td>
               
                <td>
                {matdoc["plant-code"]} || {matdoc.sloc} || {matdoc["mvt-type"]}
                </td>
                <td>
                {matdoc["account"]?.network} 
                </td>
            </tr>
             ))
             )}
        </tbody>
    </table>
</div>

         
  </div>;
}


export default Matdocs;

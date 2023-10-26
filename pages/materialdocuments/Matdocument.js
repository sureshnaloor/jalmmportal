import React from "react";
import moment from "moment";

const Matdocument = React.forwardRef(({ matdoc }, ref) => {
  const MatdocContent = (
    <div className="w-full">
    <div >
      <tr
        className="bg-white border-b dark:bg-gray-800 text-[12px] dark:border-gray-700 grid grid-cols-12"
        ref={ref}
        key={matdoc._id}
      >
        <td
          scope="row"
          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white col-span-1"
        >
          {matdoc["doc-number"]} 
        </td>
        <td
          scope="row"
          class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white col-span-1"
        >
        {matdoc["doc-item"]}
        </td>
        <td className="px-6 py-2 font-medium text-stone-800 col-span-1">
          {moment(matdoc["doc-date"]).format("MM-DD-YYYY")} 
        </td>
        <td className="px-6 py-2 font-medium text-stone-800 col-span-3">
          {matdoc["material-text"]} 
        </td>
        <td className="px-6 py-2 font-medium text-stone-800 col-span-1">
          {matdoc["doc-qty"]?.$numberDecimal} 
        </td>
        <td className="px-6 py-2 font-medium text-stone-800 col-span-1">
          {matdoc["doc-amount"]} 
        </td>

        <td className="px-6 py-2 font-medium text-stone-800 col-span-2 flex justify-evenly">
            <span className="px-1"> {matdoc["plant-code"]}</span>
            <span className="px-1">  {matdoc.sloc || "****"}</span>
            <span className="px-1"> {matdoc["mvt-type"]}</span>
              
        </td>
        <td className="px-6 py-2 font-medium text-stone-800 col-span-1"> {matdoc["account"]?.network}</td> 
      </tr>
    </div>
    </div>
  );

  const content = ref ? (
    <div ref={ref}>{MatdocContent}</div>
  ) : (
    <div>{MatdocContent}</div>
  );
  return content;
});

export default Matdocument;

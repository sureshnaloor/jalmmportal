import React from "react";


function FeaturesComponent() {
  return (
    <div className="relative bg-white opacity-50 dark:bg-gray-500 pb-5">
      <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-1 lg:items-center">
        <div className="lg:pl-2">
          <h4 className="text-[18px] leading-8 font-extrabold mb-20 text-gray-900 dark:text-white tracking-tight sm:leading-9">
            Manage everything outside SAP direct in browser
          </h4>
          <ul className="mt-2">
            <li>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="h-6 w-6"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h5 className="text-md leading-6 text-gray-900 dark:text-white font-bold">
                    Search Materials
                  </h5>
                  <p className="mt-1 text-[12px] leading-5 text-gray-500 dark:text-gray-300">
                    Know everything about your materials from your dashboard-price, stock, incoming orders, requisitions.
                  </p>
                </div>
              </div>
            </li>
            <li className="mt-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="h-6 w-6"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h5 className="text-md leading-6 text-gray-900 dark:text-white font-bold">
                    Monitor your Purchase Orders
                  </h5>
                  <p className="mt-2 text-[12px] leading-5 text-gray-500 dark:text-gray-300">
                    All your orders in one place so you can manage your
                    delivery, expediting & monitoring.
                  </p>
                </div>
              </div>
            </li>
            <li className="mt-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-12 rounded-md bg-indigo-500 text-white">
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="h-6 w-6"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M491 1536l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7l-542 542q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832h-416v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h5 className="text-md leading-6 text-gray-900 dark:text-white font-bold">
                    Control Projects
                  </h5>
                  <p className="mt-2 text-[12px] leading-5 text-gray-500 dark:text-gray-300 pb-3">
                    Projects visibility of incoming materials, stock & requisitions already made.
                  </p>
                  
                </div>
              </div>
            </li>
          </ul>
        </div>
        
      </div>
      
    </div>
  );
}

export default FeaturesComponent;

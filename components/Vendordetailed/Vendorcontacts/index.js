import React from "react";

function Vendorcontacts() {
  return (
    <div className="bg-zinc-100 w-5/6 mx-auto drop-shadow rounded-md  mb-6">
      <details className="bg-sky-100/80 open:bg-blue-50/80 duration-300 mb-9">
        <summary className="bg-inherit px-5 py-1 text-[14px] cursor-pointer">
          <h2 className="font-semibold text-[16px] tracking-wider mb-3 text-zinc-900">
            Vendor salesman contact details for different divisions:
          </h2>
        </summary>
        <div className="flex flex-row flex-wrap">
          {/* 1st contact */}
          <div className="w-1/4">
            <label
              for="helper-text"
              className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
            >
              Name of contact
            </label>
            <input
              type="email"
              id="helper-text"
              aria-describedby="helper-text-explanation"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Mohammad Al-Jal    "
            />
            <p
              id="helper-text-explanation"
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              Please enter the salesman full name
            </p>
          </div>

          <div className="w-1/4">
            <label
              for="helper-text"
              className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
            >
              Material/service groups handled.
            </label>
            <input
              type="email"
              id="helper-text"
              aria-describedby="helper-text-explanation"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Structural steel"
            />
            <p
              id="helper-text-explanation"
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              Please enter the Materials/services handled by this salesman
            </p>
          </div>

          <div className="w-1/4">
            <label
              for="helper-text"
              className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
            >
              Mobile number
            </label>
            <input
              type="email"
              id="helper-text"
              aria-describedby="helper-text-explanation"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="05612345678"
            />
            <p
              id="helper-text-explanation"
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              Please enter the Mobile number
            </p>
          </div>

          <div className="w-1/4">
            <label
              for="helper-text"
              className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
            >
              E-mail:
            </label>
            <input
              type="email"
              id="helper-text"
              aria-describedby="helper-text-explanation"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Mohammad@jal.com.sa"
            />
            <p
              id="helper-text-explanation"
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              Please enter the email of salesman
            </p>
          </div>
          

          {/* <div className="flex flex-row flex-wrap"> */}
            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Name of contact
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad Al-Jal    "
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Material/service groups handled.
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Structural steel"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Mobile number
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="05612345678"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                E-mail:
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad@jal.com.sa"
              />
            </div>
          {/* </div> */}

          {/* <div className="flex flex-row flex-wrap"> */}
            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Name of contact
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad Al-Jal    "
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Material/service groups handled.
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Structural steel"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Mobile number
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="05612345678"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                E-mail:
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad@jal.com.sa"
              />
            </div>
          {/* </div> */}

          {/* <div className="flex flex-row flex-wrap"> */}
            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Name of contact
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad Al-Jal    "
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Material/service groups handled.
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Structural steel"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Mobile number
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="05612345678"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                E-mail:
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad@jal.com.sa"
              />
            </div>
          {/* </div> */}

          {/* <div className="flex flex-row flex-wrap"> */}
            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Name of contact
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad Al-Jal    "
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Material/service groups handled.
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Structural steel"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                Mobile number
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="05612345678"
              />
            </div>

            <div className="w-1/4">
              <label
                for="helper-text"
                className="mb-2 text-xs font-medium text-gray-900 dark:text-white"
              >
                E-mail:
              </label>
              <input
                type="email"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Mohammad@jal.com.sa"
              />
            </div>
          {/* </div> */}
        </div>
      </details>
      
    </div>
  );
}

export default Vendorcontacts;

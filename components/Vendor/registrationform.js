import React from "react";

function registrationform() {
  return (
    <>
      <div className="mt-8">
        <h2
          className="
          mb-4
          text-2xl
          font-bold
          text-center text-gray-800
          lg:text-3xl
          md:mb-6
        "
        >
          Get in touch
        </h2>

        <p className="max-w-screen-md mx-auto text-center text-gray-500 md:text-lg">
          Please fill in the details below so that we can get in contact with
          you.
        </p>
      </div>
      <div className="text-gray-600">
        <div className="container flex flex-col flex-wrap px-5 py-4 mx-auto">
          <div className="flex flex-wrap mx-auto">
            <a
              className="
              inline-flex
              items-center
              justify-center
              w-1/2
              py-3
              font-medium
              leading-none
              tracking-wider
              text-indigo-500
              bg-gray-100
              border-b-2 border-indigo-500
              rounded-t
              sm:px-6 sm:w-auto sm:justify-start
              title-font
            "
            >
              STEP 1
            </a>
            <a
              className="
              inline-flex
              items-center
              justify-center
              w-1/2
              py-3
              font-medium
              leading-none
              tracking-wider
              border-b-2 border-gray-200
              sm:px-6 sm:w-auto sm:justify-start
              title-font
              hover:text-gray-900
            "
            >
              STEP 2 
            </a>
            <a
              className="
              inline-flex
              items-center
              justify-center
              w-1/2
              py-3
              font-medium
              leading-none
              tracking-wider
              border-b-2 border-gray-200
              sm:px-6 sm:w-auto sm:justify-start
              title-font
              hover:text-gray-900
            "
            >
              STEP 3 
            </a>
          </div>
          <div className="flex flex-col w-full text-center">
            <div className="py-6 bg-white sm:py-8 lg:py-12">
              <div className="px-4 mx-auto max-w-screen-2xl md:px-8">
                {/* <!-- form - start --> */}
                <form className="max-w-screen-md mx-auto">
                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor="name"
                      className="inline-flex mb-2 text-sm text-gray-800"
                    >
                      Please enter your name
                    </label>
                    <input
                      name="name"
                      className="
                      w-full
                      px-3
                      py-2
                      text-gray-800
                      border
                      rounded
                      outline-none
                      bg-gray-50
                      focus:ring
                      ring-indigo-300
                    "
                    />
                  </div>

                  <div className="flex flex-col mb-4">
                    <label
                      htmlFor="phone"
                      className="inline-flex mb-2 text-sm text-gray-800"
                    >
                      Please enter a phone number
                    </label>
                    <input
                      name="phone"
                      className="
                      w-full
                      px-3
                      py-2
                      text-gray-800
                      border
                      rounded
                      outline-none
                      bg-gray-50
                      focus:ring
                      ring-indigo-300
                    "
                    />
                  </div>

                  <div className="flex flex-col mb-2">
                    <label
                      htmlFor="company"
                      className="inline-flex mb-2 text-sm text-gray-800"
                    >
                      Please enter your company name (optional)
                    </label>
                    <input
                      name="company"
                      className="
                      w-full
                      px-3
                      py-2
                      text-gray-800
                      border
                      rounded
                      outline-none
                      bg-gray-50
                      focus:ring
                      ring-indigo-300
                    "
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      className="
                      inline-flex
                      items-center
                      px-6
                      py-2
                      text-sm text-gray-800
                      rounded-lg
                      shadow
                      outline-none
                      gap-x-1
                      hover:bg-gray-100
                    "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      Back
                    </button>
                    <button
                      className="
                      px-6
                      py-2
                      text-sm text-white
                      bg-indigo-500
                      rounded-lg
                      outline-none
                      hover:bg-indigo-600
                      ring-indigo-300
                    "
                    >
                      Next
                    </button>
                  </div>
                </form>
                {/* <!-- form - end --> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default registrationform;

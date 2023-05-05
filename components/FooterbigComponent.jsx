import React from "react";
import {useRouter} from 'next/router'

function FooterbigComponent() {

  const path = useRouter().asPath
  return (
    <div>
      <footer class="py-5 px-16 text-gray-100 bg-[#006266] dark:bg-gray-800 my-12">
        <div class="flex flex-col sm:flex-row justify-between pt-8">
          <div class="w-full sm:w-1/2">
            <h1 class="text-2xl font-bold xl:text-4xl sm:text-3xl md:mr-8">
              Every home deserves to be amazing
            </h1>
          </div>
          <div class="w-full sm:w-1/2">
            <p class="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Accusantium magnam expedita, illo quibusdam voluptatem fuga
              placeat!
            </p>
            <div class="w-full sm:w-auto flex-none flex flex-col justify-center sm:flex-row sm:items-start space-y-3 space-y-reverse sm:space-y-0 sm:space-x-4 mt-5 mx-auto xl:mx-0">
              <div class="inline-block">
                <button class="w-full lg:w-auto inline-flex items-center justify-center font-medium bg-yellow-700 text-gray-200 py-3 px-5 mb-4 hover:bg-yellow-900 hover:text-white focus:outline-none">
                  Make a request
                </button>
              </div>
              <div class="inline-block">
                <button class="w-full lg:w-auto inline-flex items-center justify-center font-medium border border-yellow-500  py-3 px-5 focus:outline-none hover:bg-yellow-50 hover:text-yellow-700">
                  Schendule site wait
                </button>
              </div>
            </div>
          </div>
        </div>
        <hr class="h-px mt-6 mx-6 bg-gray-500 border-none" />
        <div class="w-full inline-flex mt-12 items-center justify-center mx-auto text-xl font-semibold">
          <img
            src="https://cdn-icons-png.flaticon.com/128/4206/4206335.png"
            alt=""
            class="w-12 h-12 items-center mr-4"
          />
          Premium Interiors SM
        </div>
        <ul class="w-full justify-center flex flex-col text-center sm:flex-row mx-auto space-y-2 sm:space-y-0 sm:space-x-2 mt-6 overflow-hidden">
          <li>
            <button class="sm:px-4 text-gray-300 hover:text-gray-50">
              Home
            </button>
          </li>
          <li>
            <button class="sm:px-4 text-gray-300 hover:text-gray-50">
              About us
            </button>
          </li>
          <li>
            <button class="sm:px-4 text-gray-300 hover:text-gray-50">
              Service
            </button>
          </li>
          <li>
            <button class="sm:px-4 text-gray-300 hover:text-gray-50">
              Blog
            </button>
          </li>
          <li>
            <button class="sm:px-4 text-gray-300 hover:text-gray-50">
              Galleries
            </button>
          </li>
        </ul>
        <div class="items-center justify-between mt-4">
          <div class="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
            <button class="text-gray-300 hover:text-gray-200 p-1 sm:p-2 inline-flex items-center dark:hover:text-gray-300">
              <svg
                class="w-7 h-7 fill-current"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button class="text-gray-300 hover:text-gray-200 p-1 sm:p-2 inline-flex items-center dark:hover:text-gray-300">
              <svg
                class="w-7 h-7 fill-current"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>
            <button class="text-gray-300 hover:text-gray-200  p-1 sm:p-2  inline-flex items-center dark:hover:text-gray-30 dark:text-gray-400 dark:hover:text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 fill-current"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </button>
          </div>
          <div class="mx-auto py-5 text-sm text-gray-400 text-center">
            Copyright 2022 @ Premium Interiors SM
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FooterbigComponent;

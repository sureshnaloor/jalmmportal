import Image from "next/image";

import React from "react";
import { ChevronDoubleRightIcon } from "@heroicons/react/solid";

function Herocomponent() {
  return (
    <section className="flex space-x-10 px-6 mt-6  bg-gradient-to-b from-stone-100 to-stone-300 border-t-2 border-b-2 border-slate-800">
      <div className="flex align-middle justify-center dark:bg-gray-900 ">
        <Image
          className="rounded-lg mix-blend-darken dark:mix-blend-lighten"
          src="/teamwork.png"
          width={400}
          height={300}
          quality={100}
          priority
          alt="teamwork"
        ></Image>
      </div>

      <div className="flex space-y-10 flex-col pt-3 font-Lato">
        <div
          className="flex space-x-20 text-lg items-center  text-stone-900/90 dark:text-red-900/60 border-4
          border-slate-300 p-1 rounded-2xl hover:shadow-xl shadow-cyan-500/50 dark:shadow-white/50"
        >
          <h3> Search Materials</h3>
          <ChevronDoubleRightIcon className="h-8 w-8 text-fuchsia-900 animate-spin" />
        </div>
        <div
          className="flex space-x-20 text-lg items-center text-stone-900/90 dark:text-red-900/60 border-4
          border-slate-300 p-1 rounded-2xl hover:shadow-xl shadow-cyan-500/50 dark:shadow-white/50"
        >
          <h3> Monitor Purchase Orders</h3>
          <ChevronDoubleRightIcon className="h-8 w-8 text-fuchsia-900 animate-pulse" />
        </div>
        <div
          className="flex space-x-20 text-lg items-center text-stone-900/90 dark:text-red-900/60 border-4
          border-slate-300 p-1 rounded-2xl hover:shadow-xl shadow-cyan-500/50 dark:shadow-white/50"
        >
          <h3> Control Projects</h3>
          <ChevronDoubleRightIcon className="h-8 w-8 text-fuchsia-900 animate-bounce" />
        </div>
      </div>

      <div className="flex align-middle justify-center dark:bg-gray-900 ">
        <Image
          className="rounded-lg mix-blend-darken dark:mix-blend-lighten"
          src="/MMPortalpic1.jpg"
          width={500}
          height={300}
          quality={100}
          priority
          alt="Laptop"
        ></Image>
      </div>
    </section>
  );
}

export default Herocomponent;

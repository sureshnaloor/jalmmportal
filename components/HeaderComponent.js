import React from "react";
import Image from "next/image";

import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

import SwitchComponent from "../components/Switch";

import { Link, animateScroll as scroll } from "react-scroll";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHomeUser,
  faAddressCard,
  faCircleQuestion,
  faPeopleGroup,
  faSignInAlt,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

function HeaderComponent() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (
    <nav className="flex bg-gray-50 dark:bg-gray-600 flex-wrap items-center justify-between p-4">
      <div className="lg:order-2 w-auto lg:w-1/5 lg:text-center">
        <a
          className="text-lg text-gray-800 font-Montserrat font-black font-heading"
          href="#"
        ></a>
        <Image
          src="/JAHR.jpg"
          width={200}
          height={40}
          quality={100}
          priority
          placeholder="blur"
          blurDataURL="/JAHR.jpg"
          objectFit="contain"
          alt="JAL"
        ></Image>
      </div>
      <div className="block lg:hidden">
        <button className="flex items-center py-2 px-3 text-indigo-500 rounded border border-indigo-500">
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
          </svg>
        </button>
      </div>
      <div className="hidden lg:order-1 lg:block w-full lg:w-2/5">
        <div className="block lg:inline-block mt-4 lg:mt-0 mr-10 cursor-pointer text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
          <Link
            activeClass="active"
            to="features1"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
          >
            Home
            <FontAwesomeIcon
              icon={faHomeUser}
              className="text-blue-900 dark:text-yellow-300 fa-thin ml-2 text-xs"
            />
          </Link>
        </div>

        <div
          className="block lg:inline-block mt-4 lg:mt-0 mr-10 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
          <Link
            activeClass="active"
            to="section1"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
          >
            About
          <FontAwesomeIcon
            icon={faPeopleGroup}
            className="text-blue-900 dark:text-yellow-300 fa-thin ml-2 text-xs"
          />

          </Link>
          
        </div>
        <a
          className="block lg:inline-block mt-4 lg:mt-0 mr-10 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold rounded-md"
          href="#"
        >
          FAQ
          <FontAwesomeIcon
            icon={faCircleQuestion}
            className="text-blue-800 dark:text-yellow-300 fa-thin ml-2 text-xs"
          />
        </a>
        <a
          className="block lg:inline-block mt-4 lg:mt-0 mr-10 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold"
          href="#"
        >
          Contact
          <FontAwesomeIcon
            icon={faAddressCard}
            className="text-blue-800 dark:text-yellow-300 fa-thin ml-2 text-xs"
          />
        </a>

        <div className="block lg:inline-block mt-4 lg:mt-0  text-gray-400  hover:text-gray-600 dark:hover:text-white font-semibold">
          <SwitchComponent setTheme={setTheme} theme={theme} />
          <p className="text-[8px] font-bold"> toggle dark/light</p>
        </div>
      </div>

      {session?.user ? (
        <div className="flex">
          <p className="pt-5 text-[12px]   dark:text-white  text-pink-900">
            Welcome <span className="font-bold">{session.user.email}</span>
          </p>
          <button
            className="bg-stone-200 hover:bg-stone-300 text-[12px] px-6 py-2 my-3 mx-3 rounded-md outline-none focus:outline-none text-emerald-900"
            onClick={() => signOut()}
          >
            Sign Out
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="color-primary fa-thin ml-2"
            />
          </button>
        </div>
      ) : (
        <div className="flex">
          <p className="pt-5 text-[12px]   dark:text-white  text-pink-900">
            Welcome <span className="font-bold">Guest!</span>
          </p>
          <button
            className="bg-stone-200 hover:bg-stone-300 text-[12px] px-6 py-2 my-3 mx-3 rounded-md outline-none focus:outline-none text-emerald-900"
            onClick={() => signIn()}
          >
            Sign in
            <FontAwesomeIcon
              icon={faSignInAlt}
              className="color-primary fa-thin ml-2"
            />
          </button>
        </div>
      )}
    </nav>
  );
}

export default HeaderComponent;

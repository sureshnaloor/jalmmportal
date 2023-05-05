import React from "react";
import Image from "next/image";

import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import SwitchComponent from "./Switch";
import Link from "next/link";

// import { Link, animateScroll as scroll } from "react-scroll";

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

  const path = useRouter().asPath;
  // console.log(path)

  if (!mounted) return null;
  return (
    <>
      <nav className="flex bg-zinc-200 z-50 dark:bg-gray-600 items-center justify-between border-b-2 border-zinc-400  shadow-md px-1">
        <div className="order-1 w-auto lg:w-1/8 lg:text-center">
          <a
            className="text-lg text-gray-800 font-Montserrat font-black font-heading"
            href="#"
          ></a>
          <Image
            src="/images/JAL_LOGO.jpg"
            width={100}
            height={100}
            quality={100}
            priority
            placeholder="blur"
            blurDataURL="/JAHR.jpg"
            objectFit="contain"
            alt="JAL"
          ></Image>
        </div>
        <div className="block lg:hidden">
          <button className="flex items-center py-0 px-3 text-indigo-500 rounded border border-indigo-500">
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
        <div className="order-2  pl-3 py-1 flex w-full lg:w-6/8">
          <div className="bg-sky-100 p-3  text-[14px] cursor-pointer my-3 mr-3  text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/">
              <a>
                Home
                <span>
                  <FontAwesomeIcon
                    icon={faHomeUser}
                    className="text-blue-900 dark:text-yellow-300 fa-thin  text-[12px]"
                  />
                </span>
              </a>
            </Link>
          </div>

          <div className="bg-sky-100 p-3 cursor-pointer my-3 mr-3  text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/materials">
              <a>
                Materials
                <FontAwesomeIcon
                  icon={faPeopleGroup}
                  className="text-blue-900 dark:text-yellow-300 fa-thin ml-2 text-lg"
                />
              </a>
            </Link>
          </div>
          <div className="bg-sky-100 p-3 cursor-pointer my-3 mr-3 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/projects">
              <a>
                Projects
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  className="text-blue-800 dark:text-yellow-300 fa-thin ml-2 text-lg"
                />
              </a>
            </Link>
          </div>

          <div className="bg-sky-100 p-3 my-3 cursor-pointer mr-3 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/vendorpage">
              <a>
                Vendors
                <FontAwesomeIcon
                  icon={faAddressCard}
                  className="text-blue-800 dark:text-yellow-300 fa-thin ml-2 text-lg"
                />
              </a>
            </Link>
          </div>

          <div className="flex flex-row py-3 px-3 my-3 tracking-wide">
            <Link href="/openpurchaseorders">
              <a className="text-[12px] mr-2 bg-amber-100 p-1 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Open PO's
              </a>
            </Link>

            <Link href="/vendorswithpo">
              <a className="text-[12px] mr-2 bg-amber-100 p-1 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Vendor Details
              </a>
            </Link>

            <Link href="/projectdetails">
              <a className="text-[12px] mr-2 bg-amber-100 p-1 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Project Details
              </a>
            </Link>

            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 bg-amber-100 p-1 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Material Docs
              </a>
            </Link>
          </div>

          <div>
            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 block border-b-2 border-blue-600 bg-sky-100 p-1 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Equipment
              </a>
            </Link>
            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 block border-b-2 border-blue-600  bg-sky-100 p-1 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                PPE
              </a>
            </Link>
            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 border-b-2 border-blue-600 bg-sky-100 p-1 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                SIM
              </a>
            </Link>
          </div>
          <div>
            <h5 className=" p-5 my-auto px-3 font-bold tracking-tighter mx-6 rounded-md bg-slate-300 text-zinc-900 text-[12px]">
              {" "}
              Request new material/service
            </h5>
          </div>
        </div>

        <div className="block mt-4  order-3 lg:mt-0  text-gray-400  hover:text-gray-600 dark:hover:text-white font-semibold">
          <SwitchComponent setTheme={setTheme} theme={theme} />
          <p className="text-[8px] font-bold"> toggle dark/light</p>
        </div>
        {session?.user ? (
          <div className="flex flex-col order-4 ">
            <p className="pt-5 text-[16px]   dark:text-white  text-pink-900">
              Welcome <span className="font-bold">{session.user.name}</span>
            </p>
            <button
              className=" bg-stone-200 hover:bg-stone-300 text-[10px] px-2 py-1 my-1 mx-2 rounded-md outline-none focus:outline-none text-emerald-900"
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
      {path == "/" ? (
        <div className="w-full h-36 mb-[-90px] z-10">
          <svg
            className="opacity-90"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#a2d9ff"
              fill-opacity="0.9"
              d="M0,224L21.8,202.7C43.6,181,87,139,131,122.7C174.5,107,218,117,262,101.3C305.5,85,349,43,393,42.7C436.4,43,480,85,524,90.7C567.3,96,611,64,655,53.3C698.2,43,742,53,785,58.7C829.1,64,873,64,916,90.7C960,117,1004,171,1047,170.7C1090.9,171,1135,117,1178,117.3C1221.8,117,1265,171,1309,170.7C1352.7,171,1396,117,1418,90.7L1440,64L1440,0L1418.2,0C1396.4,0,1353,0,1309,0C1265.5,0,1222,0,1178,0C1134.5,0,1091,0,1047,0C1003.6,0,960,0,916,0C872.7,0,829,0,785,0C741.8,0,698,0,655,0C610.9,0,567,0,524,0C480,0,436,0,393,0C349.1,0,305,0,262,0C218.2,0,175,0,131,0C87.3,0,44,0,22,0L0,0Z"
            ></path>
          </svg>
        </div>
      ) : null}
    </>
  );
}

export default HeaderComponent;

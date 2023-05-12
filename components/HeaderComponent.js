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
    <nav className="flex  justify-between w-full bg-gradient-to-br from-sky-500 to-blue-900 via-sky-200 dark:from-zinc-200 dark:to-zinc-900  dark:bg-slate-800 border-b-2 border-zinc-400  shadow-md px-1 z-50 ">
      
        <div className=" flex align-middle w-auto bg-blue-200 lg:text-center ">
          <a
            className="text-lg text-gray-800 font-Montserrat font-black font-heading"
            href="/"
          ></a>
          <Image
            src="/images/JAL_LOGO.jpg"
            width={90}
            height={90}
            quality={100}
            priority
            placeholder="blur"
            blurDataURL="/JAHR.jpg"
            objectFit="contain"
            alt="JAL"
          ></Image>
        </div>

        <div className="w-1/3 pt-5 flex tracking-widest justify-start align-bottom">

        <div className="text-[14px] cursor-pointer font-Poppins  text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/">
              <a>
                Home
                <span>
                  <FontAwesomeIcon
                    icon={faHomeUser}
                    className="text-zinc-800 dark:text-yellow-300 fa-thin ml-1 text-[12px]"
                  />
                </span>
              </a>
            </Link>
          </div>

          <div className="ml-6 text-[14px] font-Poppins cursor-pointer  text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/materials">
              <a>
                Materials
                <FontAwesomeIcon
                  icon={faPeopleGroup}
                  className="text-zinc-800 dark:text-yellow-300 fa-thin ml-2 text-lg"
                />
              </a>
            </Link>
          </div>
          <div className="ml-6 text-[14px] font-Poppins cursor-pointer  text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/projects">
              <a>
                Projects
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  className="text-zinc-800 dark:text-yellow-300 fa-thin ml-2 text-sm"
                />
              </a>
            </Link>
          </div>

          <div className="ml-6 text-[14px] font-Poppins cursor-pointer  text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white font-semibold">
            <Link href="/vendorpage">
              <a>
                Vendors
                <FontAwesomeIcon
                  icon={faAddressCard}
                  className="text-zinc-800 dark:text-yellow-300 fa-thin ml-2 text-sm"
                />
              </a>
            </Link>
          </div>
        </div>

        <div className="flex flex-row align-middle tracking-wide ">
            <Link href="/openpurchaseorders">
              <a className="text-[12px] mr-2 my-auto py-2 px-1 bg-amber-100 hover:bg-amber-50 dark:bg-zinc-600 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Open PO's
              </a>
            </Link>

            <Link href="/vendorswithpo">
              <a className="text-[12px] mr-2 my-auto py-2 px-1 bg-amber-100  hover:bg-amber-50 dark:bg-zinc-600 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Vendor Details
              </a>
            </Link>

            <Link href="/projectdetails">
              <a className="text-[12px] mr-2 my-auto py-2 px-1 bg-amber-100 hover:bg-amber-50 dark:bg-zinc-600 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Project Details
              </a>
            </Link>

            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 my-auto  py-2 px-1 bg-amber-100 hover:bg-amber-50 dark:bg-zinc-600 text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white  font-semibold">
                Material Docs
              </a>
            </Link>
          </div>

          <div className=" w-[64px] my-auto py-1 px-3 bg-slate-400 text-white">
            <div className="font-bold text-xl"> + </div><p className="text-xs font-Poppins"> Request new Matcode</p>
          </div>

        <div className="w-1/8 tracking-widest bg-gray-100 dark:bg-gray-400 text-white dark:text-white">
        <div>
            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 block border-b-2 border-blue-600 p-1 text-gray-900  hover:text-gray-600 dark:hover:text-white  font-semibold">
                Equipment
              </a>
            </Link>
            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 block border-b-2 border-blue-600 p-1 text-gray-900  hover:text-gray-600 dark:hover:text-white  font-semibold">
                PPE
              </a>
            </Link>
            <Link href="/materialdocuments">
              <a className="text-[12px] mr-2 border-b-2 border-blue-600 p-1 text-gray-900  hover:text-gray-600 dark:hover:text-white  font-semibold">
                SIM
              </a>
            </Link>
          </div>
        </div>
       
        
        <div className="flex">
        <div className="block order-9 mt-3  text-gray-900  hover:text-gray-600 dark:hover:text-white font-semibold">
          <SwitchComponent setTheme={setTheme} theme={theme} />
          <p className="text-[8px] font-bold"> toggle dark/light</p>
        </div>


        {session?.user ? (
          <div className="flex flex-col order-10">
            <p className="pt-1 text-[12px] tracking-wider  dark:text-white  text-slate-800 font-Poppins">
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
          <div className="flex flex-col order-10">
            <p className="pt-1 text-[12px] tracking-wider   dark:text-white  text-slate-800 font-Poppins">
              Welcome <span className="font-bold">Guest!</span>
            </p>
            <button
              className="bg-stone-200 hover:bg-stone-300 text-[10px] px-2 py-1 my-1 mx-2 rounded-md outline-none focus:outline-none text-emerald-900"
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
        </div>
      
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

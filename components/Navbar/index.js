import Head from "next/head";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import SwitchComponent from "../../components/Switch";

import { Link, animateScroll as scroll } from "react-scroll";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faAddressCard,
  faCircleQuestion,
  faMoon,
  faRightFromBracket,
  faSun,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (
    <>
      <Head>
        <title>Home App</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      </Head>

      <header className="flex justify-between  bg-light-secondary dark:bg-dark-secondary text-dark-primary dark:text-light-primary">
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

        <div inline-block list-none>
          <h2 className="font-Rampart font-extrabold my-auto text-2xl  text-red-900 dark:text-white">
            JAL SAP DAWP
          </h2>
          <p className="font-Montserrat font-semibold text-white dark:text-slate-900 bg-zinc-900 dark:bg-white">
            {" "}
            Data accessed from SAP for web
          </p>
        </div>

        <nav className="flex align-middle">
          {/* <button
            className="bg-blue-500 hover:bg-blue-700  text-white text-sm px-6 my-3 mx-3 rounded-md outline-none focus:outline-none"
            onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "light" : "dark"}
          </button> */}
          <div className="mt-5 flex flex-col">
            <SwitchComponent setTheme={setTheme} theme={theme} />
            <p className="text-xs"> toggle dark/light</p>
          </div>

          <button className="bg-rose-500 hover:bg-red-700 text-white text-sm px-6 mx-3 my-3 rounded-md outline-none focus:outline-none">
            <li className="list-none">
              <Link
                activeClass="active"
                to="user1"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                Help
              </Link>
            </li>
            <FontAwesomeIcon
              icon={faCircleQuestion}
              className="color-primary fa-thin ml-2"
            />
          </button>
          <button className="bg-rose-500 hover:bg-red-700 text-white text-sm px-6 my-3 mx-3 rounded-md outline-none focus:outline-none">
            <li className="list-none">
              <Link
                activeClass="active"
                to="section1"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                {" "}
                About{" "}
              </Link>
            </li>

            <FontAwesomeIcon
              icon={faAddressCard}
              className="color-primary fa-thin ml-2"
            />
          </button>
          <button className="bg-rose-500 hover:bg-red-700 text-white text-sm p-1 mx-3 my-3 rounded-md outline-none focus:outline-none">
          <li className="list-none">
              <Link
                activeClass="active"
                to="footer1"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
            
            Contact
            <FontAwesomeIcon
              icon={faAddressBook}
              className="color-primary fa-thin ml-2"
            />
            </Link> </li>
          </button>
        </nav>
        <div>
          {session?.user ? (
            <div className="flex">
              <p className="pt-5 text-xs dark:text-white  text-pink-900">
                Welcome <span className="font-bold">{session.user.email}</span>
              </p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-sm px-6 py-2 my-3 mx-3 rounded-md outline-none focus:outline-none text-white"
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
            <button
              className="bg-slate-500 hover:bg-slate-700 px-2 mx-3 rounded"
              onClick={() => signIn()}
            >
              Welcome Guest Sign in
            </button>
          )}
        </div>
      </header>
    </>
  );
};

//     return (
//       <div className="flex justify-between p-3 bg-light-secondary dark:bg-dark-secondary text-dark-primary dark:text-light-primary">
//         <div className="font-bold my-auto text-lg">navigation bar</div>

//         <div className="flex">
//           <button onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
//             switch to {theme === "dark" ? "light" : "dark"}
//           </button>
//         </div>

//         <div className="flex">
//           <button onClick={() => signIn()}>sign in</button>
//         </div>
//       </div>
//     );
// }

export default Navbar;

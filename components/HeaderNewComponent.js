import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import SwitchComponent from "./Switch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHomeUser,
  faSignInAlt,
  faRightFromBracket,
  faKey,
  faUser,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { mainNavigationItems } from "../lib/navigationConfig";

function HeaderNewComponent() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const pathMatchesSection = (cardHref) => {
    if (!cardHref || cardHref === "#") return false;
    const target = cardHref.split("?")[0];
    const current = router.pathname;
    if (current === target) return true;
    return current.startsWith(`${target}/`);
  };

  const isNavActive = (dashboardHref) => {
    if (router.pathname === dashboardHref) return true;
    const section = mainNavigationItems.find(
      (item) => item.dashboardHref === dashboardHref
    );
    if (!section) return false;
    return section.cards.some((card) => pathMatchesSection(card.href));
  };

  return (
    <nav className="shadow-lg sticky top-0 z-50">
      <div className="bg-gradient-to-r from-sky-200 to-blue-500 px-4 py-2">
        <div className="grid grid-cols-6 gap-4 items-center">
          {/* Logo */}
          <div className="col-span-1 flex justify-center">
            <Link href="/" passHref legacyBehavior>
              <a className="flex items-center">
                <Image
                  src="/images/levlup.png"
                  width={70}
                  height={70}
                  alt="levlup"
                  className="rounded shadow"
                />
              </a>
            </Link>
          </div>

          {/* Navigation */}
          <div className="col-span-4 flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/" passHref legacyBehavior>
                <a
                  className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                    router.pathname === "/"
                      ? "text-white bg-sky-700"
                      : "text-sky-900 bg-sky-300 hover:bg-sky-100"
                  }`}
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHomeUser}
                    className="text-sm font-bold"
                  />
                  Home
                </a>
              </Link>

              <Link href="/dailymeeting" passHref legacyBehavior>
                <a
                  className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                    router.pathname.startsWith("/dailymeeting")
                      ? "text-white bg-sky-700"
                      : "text-sky-900 bg-sky-300 hover:bg-sky-100"
                  }`}
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  <FontAwesomeIcon icon={faCalendar} className="text-sm" />
                  Daily Meeting
                </a>
              </Link>

              {mainNavigationItems.map((item) => {
                const active = isNavActive(item.dashboardHref);
                return (
                  <Link
                    key={item.id}
                    href={item.dashboardHref}
                    passHref
                    legacyBehavior
                  >
                    <a
                      className={`px-4 py-2 rounded font-black text-xs flex items-center gap-2 transition-all shadow-sm ${
                        active
                          ? "text-sky-900 bg-sky-100 ring-2 ring-white"
                          : "text-white hover:text-stone-900 bg-sky-600 hover:bg-sky-200"
                      }`}
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`font-bold text-lg ${
                          active ? "text-sky-700" : "text-zinc-50"
                        }`}
                      />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User session & theme */}
          <div className="col-span-1 flex items-center justify-end gap-6">
            <div>
              <SwitchComponent setTheme={setTheme} theme={theme} />
            </div>
            {session?.user ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-white text-lg"
                  />
                  <div className="text-stone-50 tracking-wider text-sm truncate max-w-24">
                    {session.user.name}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <button
                      className="text-white hover:text-blue-200 transition-colors duration-200 p-1"
                      onClick={() => router.push("/auth/change-password")}
                      title="Change Password"
                    >
                      <FontAwesomeIcon icon={faKey} className="text-lg" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      Change Password
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  <div className="relative group">
                    <button
                      className="text-white hover:text-red-300 transition-colors duration-200 p-1"
                      onClick={() => signOut()}
                      title="Sign Out"
                    >
                      <FontAwesomeIcon
                        icon={faRightFromBracket}
                        className="text-lg"
                      />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      Sign Out
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/register" passHref legacyBehavior>
                  <a className="px-3 py-1.5 rounded font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm">
                    Register
                  </a>
                </Link>
                <Link href="/auth/login" passHref legacyBehavior>
                  <a className="px-3 py-1.5 rounded font-semibold text-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faSignInAlt} className="text-sm" />
                    Sign In
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HeaderNewComponent;

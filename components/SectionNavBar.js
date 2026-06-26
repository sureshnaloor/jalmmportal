import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { mainNavigationItems } from "../lib/navigationConfig";

function pathMatchesSection(cardHref, pathname) {
  if (!cardHref || cardHref === "#") return false;
  const target = cardHref.split("?")[0];
  if (pathname === target) return true;
  return pathname.startsWith(`${target}/`);
}

export function getSectionForPath(pathname) {
  return (
    mainNavigationItems.find((section) => {
      if (pathname === section.dashboardHref) return true;
      return section.cards.some((card) =>
        pathMatchesSection(card.href, pathname)
      );
    }) || null
  );
}

/**
 * Compact breadcrumb bar for sub-pages — links back to Home and the section dashboard.
 */
function SectionNavBar({ section, className = "" }) {
  if (!section) return null;

  return (
    <nav
      className={`flex flex-wrap items-center gap-2 text-sm ${className}`}
      aria-label="Section navigation"
    >
      <a
        href="/"
        className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 font-medium text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FontAwesomeIcon icon={faHome} className="text-xs" />
        Home
      </a>
      <span className="text-gray-400">/</span>
      <a
        href={section.dashboardHref}
        className="rounded-md bg-sky-100 px-2.5 py-1 font-semibold text-sky-800 transition hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-200"
      >
        {section.label}
      </a>
    </nav>
  );
}

export default SectionNavBar;

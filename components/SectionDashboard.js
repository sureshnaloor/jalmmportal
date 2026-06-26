import React from "react";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faHome,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import HeaderNewComponent from "./HeaderNewComponent";
import FooterComponent from "./FooterComponent";

const COLOR_STYLES = {
  sky: {
    card: "bg-sky-50 border-sky-200/90 text-sky-950 shadow-[0_8px_24px_rgba(14,165,233,0.12)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.2)]",
    accent: "text-sky-600",
    badge: "bg-sky-100 text-sky-800",
  },
  violet: {
    card: "bg-violet-50 border-violet-200/90 text-violet-950 shadow-[0_8px_24px_rgba(124,58,237,0.12)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.2)]",
    accent: "text-violet-600",
    badge: "bg-violet-100 text-violet-800",
  },
  amber: {
    card: "bg-amber-50 border-amber-200/90 text-amber-950 shadow-[0_8px_24px_rgba(245,158,11,0.12)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.2)]",
    accent: "text-amber-600",
    badge: "bg-amber-100 text-amber-800",
  },
  emerald: {
    card: "bg-emerald-50 border-emerald-200/90 text-emerald-950 shadow-[0_8px_24px_rgba(16,185,129,0.12)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.2)]",
    accent: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-800",
  },
  rose: {
    card: "bg-rose-50 border-rose-200/90 text-rose-950 shadow-[0_8px_24px_rgba(244,63,94,0.12)] hover:shadow-[0_12px_32px_rgba(244,63,94,0.2)]",
    accent: "text-rose-600",
    badge: "bg-rose-100 text-rose-800",
  },
  cyan: {
    card: "bg-cyan-50 border-cyan-200/90 text-cyan-950 shadow-[0_8px_24px_rgba(6,182,212,0.12)] hover:shadow-[0_12px_32px_rgba(6,182,212,0.2)]",
    accent: "text-cyan-600",
    badge: "bg-cyan-100 text-cyan-800",
  },
  fuchsia: {
    card: "bg-fuchsia-50 border-fuchsia-200/90 text-fuchsia-950 shadow-[0_8px_24px_rgba(217,70,239,0.12)] hover:shadow-[0_12px_32px_rgba(217,70,239,0.2)]",
    accent: "text-fuchsia-600",
    badge: "bg-fuchsia-100 text-fuchsia-800",
  },
  teal: {
    card: "bg-teal-50 border-teal-200/90 text-teal-950 shadow-[0_8px_24px_rgba(20,184,166,0.12)] hover:shadow-[0_12px_32px_rgba(20,184,166,0.2)]",
    accent: "text-teal-600",
    badge: "bg-teal-100 text-teal-800",
  },
  indigo: {
    card: "bg-indigo-50 border-indigo-200/90 text-indigo-950 shadow-[0_8px_24px_rgba(99,102,241,0.12)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.2)]",
    accent: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-800",
  },
  orange: {
    card: "bg-orange-50 border-orange-200/90 text-orange-950 shadow-[0_8px_24px_rgba(249,115,22,0.12)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.2)]",
    accent: "text-orange-600",
    badge: "bg-orange-100 text-orange-800",
  },
  lime: {
    card: "bg-lime-50 border-lime-200/90 text-lime-950 shadow-[0_8px_24px_rgba(132,204,22,0.12)] hover:shadow-[0_12px_32px_rgba(132,204,22,0.2)]",
    accent: "text-lime-600",
    badge: "bg-lime-100 text-lime-800",
  },
  pink: {
    card: "bg-pink-50 border-pink-200/90 text-pink-950 shadow-[0_8px_24px_rgba(236,72,153,0.12)] hover:shadow-[0_12px_32px_rgba(236,72,153,0.2)]",
    accent: "text-pink-600",
    badge: "bg-pink-100 text-pink-800",
  },
};

const SIZE_CLASSES = {
  xl: "md:col-span-2 md:row-span-2 min-h-[220px] md:min-h-[280px]",
  lg: "md:col-span-2 min-h-[160px]",
  md: "min-h-[140px]",
  sm: "min-h-[120px]",
};

const TITLE_SIZE = {
  xl: "text-xl md:text-2xl",
  lg: "text-lg md:text-xl",
  md: "text-base md:text-lg",
  sm: "text-sm md:text-base",
};

function DashboardCard({ card }) {
  const styles = COLOR_STYLES[card.color] || COLOR_STYLES.sky;
  const size = card.size || "md";
  const isDisabled = !card.href || card.href === "#";

  const className = `group flex flex-col rounded-2xl border p-5 md:p-6 transition-all duration-200 ${SIZE_CLASSES[size]} ${styles.card} ${
    isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:-translate-y-0.5"
  }`;

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`font-bold leading-snug tracking-tight ${TITLE_SIZE[size]}`}
        >
          {card.label}
        </h3>
        {!isDisabled && (
          <FontAwesomeIcon
            icon={faArrowRight}
            className={`mt-1 shrink-0 text-sm opacity-60 transition-transform group-hover:translate-x-1 ${styles.accent}`}
          />
        )}
      </div>
      <p
        className={`mt-2 leading-relaxed opacity-80 ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {card.description}
      </p>
      {size === "xl" && (
        <span
          className={`mt-auto inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}
        >
          Primary
        </span>
      )}
    </>
  );

  if (isDisabled) {
    return <div className={className}>{cardContent}</div>;
  }

  return (
    <a href={card.href} className={`block no-underline text-inherit ${className}`}>
      {cardContent}
    </a>
  );
}

function SectionDashboard({ section }) {
  const { label, description, dashboardHref, icon, cards } = section;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Head>
        <title>{label} | JAL MM Portal</title>
        <meta name="description" content={description} />
      </Head>

      <HeaderNewComponent />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-sm"
          aria-label="Breadcrumb"
        >
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium text-sky-700 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-50 dark:bg-gray-800 dark:text-sky-300 dark:ring-gray-700"
          >
            <FontAwesomeIcon icon={faHome} className="text-xs" />
            Home
          </a>
          <span className="text-gray-400">/</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 font-semibold text-white shadow-sm">
            <FontAwesomeIcon icon={icon} className="text-xs" />
            {label}
          </span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg">
              <FontAwesomeIcon icon={icon} className="text-xl" />
            </div>
            <div>
              <h1
                className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-3xl"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {label}
              </h1>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                {description}
              </p>
            </div>
          </div>
        </header>

        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <FontAwesomeIcon icon={faThLarge} />
          <span>Choose a destination</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800">
            {cards.length} pages
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-fr md:gap-5">
          {cards.map((card) => (
            <DashboardCard key={`${card.href}-${card.label}`} card={card} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faHome} />
            Back to Home
          </a>
          <a
            href={dashboardHref}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-200"
          >
            <FontAwesomeIcon icon={faThLarge} />
            {label} Dashboard
          </a>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}

export default SectionDashboard;

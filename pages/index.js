import Head from "next/head";
import { useState, useEffect } from "react";
// import Navbar from '../components/Navbar'

import {getSession} from "next-auth/react"
import HeaderComponent from "../components/HeaderComponent";
import Matgrouplist from "../components/Matgrouplist";

import FeaturesComponent from "../components/FeaturesComponent";
import CarousalComponent from "../components/CarousalComponent";
import SectionComponent from "../components/SectionComponent";
import FooterComponent from "../components/FooterComponent";

function Home() {
  const [matgroups, setmatgroups] = useState([]);

  useEffect(() => {
    const fetchMatgroups = async () => {
      const response = await fetch("/api/matgroup");
      const json = await response.json();
      setmatgroups(json);
    };
    fetchMatgroups();
  }, []);

  // Sticky Menu Area
  useEffect(() => {
    window.addEventListener("scroll", isSticky);
    return () => {
      window.removeEventListener("scroll", isSticky);
    };
  });

  /* Method that will fix header after a specific scrollable */
  const isSticky = (e) => {
    const header = document.querySelector("#sticky");
    const scrollTop = window.scrollY;
    scrollTop >= 100
      ? header.classList.add("is-sticky")
      : header.classList.remove("is-sticky");
  };

  return (
    <div className="bg-light-primary dark:bg-dark-primary h-screen">
      <Head>
        <title>JAL MM Portal</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="sticky">
        <HeaderComponent />
      </div>

      <div>
        <FeaturesComponent id="features1" />
      </div>

      <div className="flex justify-center bg-slate-100 dark:bg-dark-primary">
        <Matgrouplist matgroups={matgroups} id="user1" />
      </div>

      {/* <div>
        <CarousalComponent />
      </div> */}

      <section>
        <SectionComponent id="section1" />
      </section>

      <footer>
        <FooterComponent id="footer1" />
      </footer>
    </div>
  );  
}

  // export async function getServerSideProps(context) {
  //   const session = await getSession(context)

  //   if (!session) {
  //     return {
  //       redirect: {
  //         destination: '/',
  //         permanent: false,
  //       },
  //     }
  //   }

  //   return {
  //     props: { session }
  //   }
  // }

export default Home

import Head from "next/head";
import { useState, useEffect } from "react";
// import Navbar from '../components/Navbar'

import {getSession} from "next-auth/react"
import HeaderComponent from "../components/HeaderComponent";
import Matgrouplist from "../components/Matgrouplist";

import FeaturesComponent from "../components/FeaturesComponent";
import CarousalComponent from "../components/CarousalComponent";
import SectionComponent from "../components/SectionComponentnew";
import FooterComponent from "../components/FooterComponent";
// import NavigationbetterComponent from "../components/NavigationbetterComponent";

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

  console.log(matgroups)

  

  return (
    <div className="bg-light-primary dark:bg-dark-primary ">
      <Head>
        <title>JAL MM Portal</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <HeaderComponent />
        {/* <NavigationbetterComponent />  */}
      </div>
      <div className="flex w-full justify-between">
        <div className="w-2/7 px-3">
          <CarousalComponent />
        </div>
        <div className="w-2/7 px-3">
          <FeaturesComponent />
        </div>
        
      </div>

      <div>
        <Matgrouplist matgroups={matgroups} />
      </div>
      <div>
        <SectionComponent />
      </div>

      <footer>
        <FooterComponent />
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

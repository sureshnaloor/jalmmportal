import Head from 'next/head'
import {useState, useEffect} from 'react'
import Navbar from '../components/Navbar'
 
export default function Home() {
  
  return (
    <div className='bg-light-primary dark:bg-dark-primary h-screen'>
      <Head>
        <title>JAL MM Portal</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <Navbar />
        <h1 className='text-xl font-bold p-5 text-dark-primary dark:text-light-primary'>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>      
    </div>
  )
}

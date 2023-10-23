import "../styles/globals.css";
import "../styles/tailwind.css";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {useRouter} from 'next/router'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"


import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically

const queryClient = new QueryClient();

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter()
  return (
    <AnimatePresence mode="sync">
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <motion.div
        key={router.route}
        initial="initialState" animate="animateState" exit="exitState" 
        transition = {
          {duration: 2.5}
        }
        variants = {{
          initialState:{
            opacity:0,
            clipPath:"polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          },
          animateState:{
            opacity:1,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          },
          exitState:{
            clipPath:"polygon(50% 0, 50% 0, 50% 100%, 50% 100%)"
          }
        }}
        >
        <Component {...pageProps} />
        <ToastContainer />
        </motion.div>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
    </AnimatePresence>
  );
}

export default MyApp;

import React from "react";
import { useRouter } from "next/router";
import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";

function Matgroup() {
  const router = useRouter();
  let matgroup = router.query.matgroup;
  //   console.log(router.query)
  return (<>
  <HeaderComponent />
  

  <FooterComponent />
  </>)
}

export default Matgroup;

import dynamic from "next/dynamic";
import { useEffect, useState } from "react"


const VendorwisePDF = dynamic(() => import("./[vendorcode]"), {
    ssr: false,
  });


const View = () => {

    const [client, setClient] = useState(false)

    useEffect(() => {
        setClient(true)
    }, [])

    return(
        <VendorwisePDF/>
    )
}


export default View
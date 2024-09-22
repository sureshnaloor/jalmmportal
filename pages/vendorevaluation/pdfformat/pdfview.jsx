import dynamic from "next/dynamic";
import { useEffect, useState } from "react"


const VendorevaluationPDF = dynamic(() => import("./pdf"), {
    ssr: false,
  });


const View = () => {

    const [client, setClient] = useState(false)

    useEffect(() => {
        setClient(true)
    }, [])

    return(
        <VendorevaluationPDF/>
    )
}


export default View
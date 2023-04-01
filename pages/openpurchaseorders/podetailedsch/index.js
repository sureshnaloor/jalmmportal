import React from 'react'
import Purchaseorderschedule from '../../../components/Purchaseorderschedule'
import Router , {useRouter}  from 'next/router';

function Podetailedsch() {
    const router = useRouter()
    const {ponumber} = router.query
  return (
    <div>
        <Purchaseorderschedule ponumber={ponumber} /> 
    </div>
  )
}

export default Podetailedsch
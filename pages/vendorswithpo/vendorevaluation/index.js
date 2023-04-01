import React from 'react'
import Vendorevaluation from '../../../components/Vendorevaluation'
import Router , {useRouter}  from 'next/router';

function Vendorevaluationcomp() {
    const router = useRouter()
    const {vendornumber} = router.query
  return (
    <div>
        <Vendorevaluation vendornumber={vendornumber} /> 
    </div>
  )
}

export default Vendorevaluationcomp
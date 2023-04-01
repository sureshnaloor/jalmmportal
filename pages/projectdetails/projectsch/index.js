import React from 'react'
import Projectschedule from '../../../components/Projectschedule'
import Router , {useRouter}  from 'next/router';

function Projectssch() {
    const router = useRouter()
    const {projnumber} = router.query
  return (
    <div>
        <Projectschedule projnumber={projnumber} /> 
        this is the schedule page
    </div>
  )
}

export default Projectssch
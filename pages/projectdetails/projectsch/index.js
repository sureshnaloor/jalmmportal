import React from 'react'
import Projectschedule from '../../../components/Projectschedule'
import Router , {useRouter}  from 'next/router';
import Navigationcomp from '../../../components/Navigationcomponent';

function Projectssch() {
    const router = useRouter()
    const {projnumber} = router.query
  return (
    <div>
    <Navigationcomp /> 
      <div class="relative pb-6 mb-3 overflow-hidden rounded-lg shadow-lg cursor-pointer m-4 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
      <img
          class="object-cover w-full h-60"
          src="/images/openpo.jpg"
          alt="hardhat"
        />   
        <Projectschedule projnumber={projnumber} /> 
        
      </div>
    </div>
  )
}

export default Projectssch


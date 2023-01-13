import React from 'react'
import Projectdetails from '../../components/Projectdetails'
import HeaderComponent from '../../components/HeaderComponent'


function Projects() {
  return (
    <>
    <div>
      <HeaderComponent />
    </div>
    <div>
        {/* this is projects pages */}
        <Projectdetails />
    </div>
    
    </>
  )
}

export default Projects
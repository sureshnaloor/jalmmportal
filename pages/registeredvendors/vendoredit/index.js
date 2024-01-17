import React from 'react'
import {useRouter}  from 'next/router';

function Vendoredit() {
    const router = useRouter()
    const {vendor} = router.query
    let vendor1 = JSON.parse(vendor)
  return (
    <div className='bg-zinc-100 w-3/4 h-3/4 flex mx-auto'>
    <div>Vendoredit page
        <h1> {vendor1.vendorname}</h1>
        <h2> {vendor1.address.city}</h2>
        <h2> {vendor1.address.pobox}</h2>
        <h2> {vendor1.address.zipcode}</h2>
    </div>
    </div>
  )
}

export default Vendoredit
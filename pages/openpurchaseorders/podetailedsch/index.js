import React from 'react'
// import Purchaseorderschedule from '../../../components/Purchaseorderschedule'

import GeneralPOData from '../../../components/POSchedule/GeneralPOData'; 
import PaymentScheduleData from '../../../components/POSchedule/PaymentScheduleData';
import BankGuaranteeData from '../../../components/POSchedule/BankGuaranteeData';
import LCData from '../../../components/POSchedule/LCData';
import ProgressMilestoneData from '../../../components/POSchedule/ProgressMilestoneData';
import ShipmentData from '../../../components/POSchedule/ShipmentData';

import Router , {useRouter}  from 'next/router';
// import Navigationcomp from '../../../components/Navigationcomponent';
import Headercomponent from '../../../components/HeaderComponent'

function Podetailedsch() {
    const router = useRouter()    
    const {ponumber} = router.query
    // console.log(ponumber)
  return (
    <div>
      {/* <Navigationcomp />  */}
      < Headercomponent />
      <div className="relative pb-6 mb-3 overflow-hidden rounded-lg shadow-lg cursor-pointer m-4 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2">
      <img
          className="object-cover w-full h-60"
          src="/images/openpo.jpg"
          alt="openpoimg"
        />
    </div>
        {/* <Purchaseorderschedule ponumber={ponumber} />  */}
        <GeneralPOData ponumber={ponumber} />
        <PaymentScheduleData ponumber={ponumber} />
        <BankGuaranteeData ponumber={ponumber} />
        <LCData ponumber={ponumber} />
        <ProgressMilestoneData ponumber={ponumber} />
        <ShipmentData ponumber={ponumber} />
    </div>
  )
}

export default Podetailedsch
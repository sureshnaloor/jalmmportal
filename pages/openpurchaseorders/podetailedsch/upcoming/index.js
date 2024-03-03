import React, { useEffect, useState } from "react";

import Bgcomponent from "../../../../components/Purchaseordersupcoming/Bgcomponent";
import Lccomponent from "../../../../components/Purchaseordersupcoming/Lccomponent";
import Opendelcomponent from "../../../../components/Purchaseordersupcoming/Opendelcomponent";
import Openmilestonecomponent from "../../../../components/Purchaseordersupcoming/Openmilestonecomponent";
import classNames from 'classnames'

function UpcomingPurchaseactivities() {
  const [openBg, setOpenbg] = useState(true);
  const [openLc, setOpenlc] = useState(false);
  const [openDel, setOpendel] = useState(false);
  const [openMilestones, setOpenmilestones] = useState(false);
  const [activeTab, setActivetab] = useState('openBg')

  
  return (
    <div>
        <div className="mx-auto mt-5 mb-5">
      <p className="w-1/2 mx-auto tracking-widest font-Lato text-[14px] font-bold shadow-md shadow-zinc-500 p-3 bg-zinc-50">
        {" "}
        This is the tabbed page which will show different upcoming things to be
        alerted in next 2 weeks
      </p>
      </div>

      <div>
        {/* <div className="sm:hidden">
          <label htmlFor="Tab" className="sr-only">
            Tab
          </label>

          <select id="Tab" className="w-full rounded-md border-gray-200">
            <option>Expiring Bank Guarantees </option>
            <option>Expiring Letter of Credits</option>
            <option>Delivery deadlines approaching</option>
            <option select>Milestones approaching</option>
          </select>
        </div> */}

        <div className="hidden sm:block">
          <div className="border-b border-gray-200 w-1/2 mx-auto">
            <nav className="-mb-px flex gap-3">
              <a
                onClick={() => {
                  setOpenbg(true);
                  setOpenlc(false);
                  setOpendel(false);
                  setOpenmilestones(false);
                  setActivetab('openBg')
                }}
                className={`cursor-pointer shrink-0 rounded-t-lg border border-gray-300 border-b-white p-3 text-sm font-medium  ${activeTab == 'openBg' ? 'bg-zinc-100 shadow-lg shadow-zinc-900 cursor-none' : 'bg-sky-800 text-white'}`}
              >
                Expiring Bank Guarantees
              </a>

              <a
                onClick={() => {
                  setOpenlc(true);
                  setOpenbg(false);
                  setOpendel(false);
                  setOpenmilestones(false);
                  setActivetab('openLc')
                }}
                className={`cursor-pointer shrink-0 rounded-t-lg border border-gray-300 border-b-white p-3 text-sm font-medium  ${activeTab == 'openLc' ? 'bg-zinc-100 shadow-lg shadow-zinc-900' : 'bg-sky-900 text-white'}`}
              >
                Expiring Letter of Credits
              </a>

              <a
                onClick={() => {
                  setOpendel(true);
                  setOpenbg(false);
                  setOpenlc(false);
                  setOpenmilestones(false);
                  setActivetab('openDel')
                }}
                className={`cursor-pointer shrink-0 rounded-t-lg border border-gray-300 border-b-white p-3 text-sm font-medium ${activeTab == 'openDel' ? 'bg-zinc-100 shadow-lg shadow-zinc-900' : 'bg-sky-900 text-white'}`}
              >
                Delivery deadlines approaching
              </a>

              <a
                onClick={() => {
                  setOpenmilestones(true);
                  setOpenbg(false);
                  setOpenlc(false);
                  setOpendel(false);
                  setActivetab('openMilestones')
                }}
                className={`cursor-pointer shrink-0 rounded-t-lg border border-gray-300 border-b-white p-3 text-sm font-medium ${activeTab == 'openMilestones' ? 'bg-zinc-100 shadow-lg shadow-zinc-900' : 'bg-sky-900 text-white'}`}
              >
                Milestones approaching
              </a>
            </nav>
                <div className="mt-6 ">
            {openBg && <Bgcomponent />}
            {openLc && <Lccomponent />}
            {openDel && <Opendelcomponent />}
            {openMilestones && <Openmilestonecomponent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpcomingPurchaseactivities;

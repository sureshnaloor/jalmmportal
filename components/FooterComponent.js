import React from 'react'

function FooterComponent({id}) {
  return (
    <>
    {/* <h2> start of footer</h2> */}
    <div className="flex justify-between bg-gray-50 border-t-[1.5px] border-zinc-600 dark:bg-gray-900 font-Lato" id={id}>
      <div className="basis-1/2 pb-3 pl-3">
        <h3 className="text-teal-600 pb-2 font-mono text-sm pt-2 font-extrabold">
          About
        </h3>
        <div className="dark:text-slate-100 text-red-900 text-[10px] pb-3 pr-3"> 
          JAL SAP DAWP is an initiative to help estimation and project engineers
          of JAL to utilize SAP data in a user-friendly and faster way The
          web-site is developed using React and is off-line with mostly one day
          delay in the data which is however enough for most of the estimation
          and project needs. For online and exact data however, SAP HANA is to
          be logged in.
          <br />
          <div className='full-w border-b border-gray-600'> </div>
          This site is developed by{" "}
          <span className="dark:text-fuchsia-400 text-fuchsia-900"> Suresh Naloor </span>
        </div>
      </div>

      <div className="basis-1/8 pb-3">
        <h3 className="text-teal-600 font-mono text-sm pt-2 font-extrabold">
          Technology
        </h3>
        <ul className="dark:text-fuchsia-400  text-fuchsia-900 text-[10px] pt-3 pl-2">
          <li> Nextjs</li>
          <li> React</li>
          <li> MongoDB</li>
        </ul>
      </div>

      <div className="basis-1/3 pb-3">
        <h3 className="text-teal-600 font-mono text-sm pt-2 font-extrabold">
          Legal
        </h3>
        <p className="text-[10px] dark:text-fuchsia-400 text-fuchsia-900 pt-3">
          This Website is a copyrighted work belonging to JAL International.
        </p>
        <p className="text-[8px] pt-3 dark:text-gray-300 text-gray-900">
          Account Creation. For you to use the Site, you have to register. You
          warrant that you will maintain the accuracy of such information. You
          may request to delete your Account at any time. JAL may suspend or
          terminate your Account at any time.
        </p>
      </div>
    </div>
    {/* <h1> this is end f footer</h1> */}
    </>
  );
}

export default FooterComponent
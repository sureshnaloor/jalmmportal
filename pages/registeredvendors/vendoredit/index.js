import React, {useState, } from 'react'

import { useForm } from "react-hook-form";
import {useRouter}  from 'next/router';
import Image from "next/image";


import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderComponent from '../../../components/HeaderComponent';
import FooterComponent from '../../../components/FooterComponent';


function Vendoredit() {
  const { data: session } = useSession();
  const router = useRouter()
  const {vendor} = router.query

  let vendor1 = JSON.parse(vendor)

  const [vendorName, setVendorName] = useState(vendor1.vendorname)
  const [vendorcode, setVendorcode] = useState(vendor1.vendorcode || null)

  // address related fields 

  const [countrycode, setCountrycode] = useState(vendor1.address.countrycode)
  const [city,setCity] = useState(vendor1.address.city)
  const [address1, setAddress1] = useState(vendor1.address.address1)
  const [address2, setAddress2] = useState(vendor1.address.address2)
  const [pobox, setPobox] = useState(vendor1.address.pobox)
  const [zipcode, setZipcode] = useState(vendor1.address.zipcode)

  // contact related fields 

  const [salesname, setSalesname] = useState(vendor1.contact.salesname)
  const [telephone1, setTelephone1] = useState(vendor1.contact.telephone1)
  const [telephone2, setTelephone2] = useState(vendor1.contact.telephone2)
  const [fax,setFax] = useState(vendor1.contact.fax)
  const [salesemail, setSalesemail] = useState(vendor1.contact.salesemail)
  const [salesmobile, setSalesmobile] = useState(vendor1.contact.salesmobile)

  //company related fields 

  const [ taxnumber, setTaxnumber] = useState(vendor1.taxnumber)
  const [companyregnumber, setCompanyregnumber] = useState(vendor1.companyregistrationnumber)
  const [website, setWebsite] = useState(vendor1.companywebsite)
  const [email, setEmail] = useState(vendor1.companyemail)

  // metadata

  // const [createdDate, setCreatedDate] = useState(vendor1["created_date"])
  // const [createdBy, setCreatedBy] = useState(vendor1["created_by"])

  

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) =>  {
    console.log(data)
    console.log("I am clicked- submit")
    // console.log(vendorname)
    console.log(session.user.name)
    data.username = session.user.name
    data.created_date = vendor1["created_date"]
    data.created_by = vendor1["created_by"]

    await fetch(`/api/registeredvendors/update/${vendor1.vendorname}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    toast.success("Vendor record is updated succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    
    router.back();
  };
    



  const onErrors = (errors) => console.error(errors);

  return (
    <>
    <div className='mb-6'><HeaderComponent /></div>
    <div className="flex justify-center align-middle ml-3">
        {session.user.role == "admin" ||
        session.user.role == "buyer" ? null : (
          <div className="bg-amber-200 w-2/3 text-stone-800 text-2xl min-h-[80vh] min-w-[80vw] p-44 italic">
            <div className='grid grid-cols-9 gap-1'>
             <p className='col-span-2  bg-teal-600 p-3 text-white text-[14px] font-semibold'>Sorry, you do not have authorization to edit vendor
             </p>

              <div className='col-span-7'>
              <Image
                  src="/images/notauthorized.png"
                  width={1400}
                  height={400}
                  quality={100}
                  priority
                  
                  objectFit="contain"
                  alt="notauthorized"
                ></Image>
                </div>
           </div>
          </div>
        )}
      </div>

      {session.user.role == "admin" ||
        session.user.role == "buyer" ? (
    <form onSubmit={handleSubmit(onSubmit, onErrors)}>
    <p className='p-1 text-[12px] mx-auto px-32 w-1/2 bg-teal-600 text-white font-bold uppercase italic'> Only Admin users can change vendor name.</p>
    <div className='bg-zinc-100 grid grid-cols-3 gap-3 border-r-2 border-r-slate-400 mt-5 ml-5 mr-5'>
      
      <div className="col-span-1 p-3">
    <div className="flex flex-col bg-slate-100 p-3 border-r-4 border-slate-400/20 shadow-slate-400 shadow-md">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="vendorName"
                    id="vendorName"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("vendorName")}
                    value={vendorName}
                    onChange = {(e) => setVendorName(e.target.value)}
                    readOnly = {session.user.role != "admin" }
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.vendorName && errors.vendorName.message}{" "}
                  </p>

                  <label
                    htmlFor="vendorName"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Vendor's Name:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="vendorcode"
                    id="vendorcode"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("vendorcode")}
                    value={vendorcode}
                    onChange = {(e) => setVendorcode(e.target.value)}
                    readOnly = {session.user.role != "admin" }
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.vendorcode && errors.vendorcode.message}{" "}
                  </p>

                  <label
                    htmlFor="vendorcode"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Vendor Code assigned:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="countrycode"
                    id="countrycode"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("countrycode")}
                    onChange={(e => setCountrycode(e.target.value))}
                    value = {countrycode}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.countrycode && errors.countrycode.message}{" "}
                  </p>

                  <label
                    htmlFor="vendorCountry"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Country:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="city"
                    id="city"
                    className="block py-2.5 px-0 w-1/2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("city")}
                    onChange={e => setCity(e.target.value)}
                    value = {city}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.city && errors.city.message}{" "}
                  </p>

                  <label
                    htmlFor="city"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Head office City:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="address1"
                    id="address1"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("address1")}
                    value={address1}
                    onChange = {e => setAddress1(e.target.value)}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.address1 && errors.address1.message}{" "}
                  </p>

                  <label
                    htmlFor="address1"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Address (1st Line):
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="address2"
                    id="address2"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("address2")}
                    value = {address2}
                    onChange={e => setAddress2(e.target.value)}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.address2 && errors.address2.message}{" "}
                  </p>

                  <label
                    htmlFor="address2"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Address 2nd Line:
                  </label>
                </div>

                <div className="relative z-0 w-1/2 mb-6 group">
                  <input
                    type="text"
                    name="pobox"
                    id="pobox"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("pobox")}
                    value = {pobox}
                    onChange={e => setPobox(e.target.value)}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.pobox && errors.pobox.message}{" "}
                  </p>

                  <label
                    htmlFor="pobox"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    PO Box Number:
                  </label>
                </div>

                <div className="relative z-0 w-1/2 mb-6 group">
                  <input
                    type="text"
                    name="zipcode"
                    id="zipcode"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("zipcode")}
                    value = {zipcode}
                    onChange={e => setZipcode(e.target.value)}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.zipcode && errors.zipcode.message}{" "}
                  </p>

                  <label
                    htmlFor="zipcode"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    ZIP Code:
                  </label>
                </div>
              </div>
              </div>
                    {/* second column */}
                    <div className='col-span-1 p-3'>
              <div className="flex flex-col border-r-2 border-teal-400/20 shadow-teal-200 shadow-md bg-teal-50 p-3">
                <div className="relative z-0 w-1/2 mb-6 group">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="block py-2.5 px-0 w-full text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("email")}
                    onChange={e => setEmail(e.target.value)}
                    value={email}

                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.email && errors.email.message}{" "}
                  </p>

                  <label
                    htmlFor="email"
                    className="peer-focus:font-medium absolute text-sm text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Company Email:
                  </label>
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="telephone1"
                    id="telephone1"
                    
                    className="block py-2.5 px-0 w-1/2 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("telephone1")}
                    onChange={e => setTelephone1(e.target.value)}
                    value = {telephone1}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.telephone1 && errors.telephone1.message}{" "}
                  </p>

                  <label
                    htmlFor="telephone1"
                    className="peer-focus:font-semibold absolute text-[14px] text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Telephone Number:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="telephone2"
                    id="telephone2"
                    
                    className="block py-2.5 px-0 w-1/2 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("telephone2")}
                    onChange={e => setTelephone2(e.target.value)}
                    value = {telephone2}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.telephone2 && errors.telephone2.message}{" "}
                  </p>

                  <label
                    htmlFor="telephone2"
                    className="peer-focus:font-medium absolute text-sm text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Alternate Telephone Number:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="fax"
                    id="fax"
                    className="block py-2.5 px-0 w-1/2 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("fax")}
                    onChange={e=> setFax(e.target.value)}
                    value = {fax}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.fax && errors.fax.message}{" "}
                  </p>

                  <label
                    htmlFor="telephone1"
                    className="peer-focus:font-medium absolute text-sm text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Facsimile Number:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="salesname"
                    id="salesname"
                    className="block py-2.5 px-0 w-2/3 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("salesname")}
                    onChange={e => setSalesname(e.target.value)}
                    value = {salesname}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.salesname && errors.salesname.message}{" "}
                  </p>

                  <label
                    htmlFor="salesperson"
                    className="peer-focus:font-medium absolute text-sm text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Salesperson Name:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="salesemail"
                    id="salesemail"
                    className="block py-2.5 px-0 w-2/3 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("salesemail")}
                    onChange={e => setSalesemail(e.target.value)}
                    value = {salesemail}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.salesemail && errors.salesemail.message}{" "}
                  </p>

                  <label
                    htmlFor="salesemail"
                    className="peer-focus:font-medium absolute text-sm text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Salesperson Email:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="salesmobile"
                    id="salesmobile"
                    className="block py-2.5 px-0 w-1/2 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("salesmobile")}
                    onChange={e => setSalesmobile(e.target.value)}
                    value = {salesmobile}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.salesmobile && errors.salesmobile.message}{" "}
                  </p>

                  <label
                    htmlFor="salesmobile"
                    className="peer-focus:font-medium absolute text-sm text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Salesperson Mobile:
                  </label>
                </div>
              </div>
              </div>

              {/* thid column */}
              <div className='col-span-1 p-3'>
              <div className="bg-sky-50 p-3 border-r-2 border-sky-400/20 shadow-md shadow-sky-200">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="taxnumber"
                    id="taxnumber"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("taxnumber")}
                    onChange={e => setTaxnumber(e.target.value)}
                    value = {taxnumber}
                  />
                  <p className="text-[10px] text-red-900">
                    {errors?.taxnumber && errors.taxnumber.message}{" "}
                  </p>

                  <label
                    htmlFor="taxnumber"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Tax (VAT) Number:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="companyregnumber"
                    id="companyregnumber"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("companyregnumber")}
                    onChange={e => setCompanyregnumber(e.target.value)}
                    value={companyregnumber}
                  />
                  <p className="text-[10px] text-red-900">
                    {errors?.companyregnumber &&
                      errors.companyregnumber.message}{" "}
                  </p>

                  <label
                    htmlFor="companyregnumber"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Company Registration Number:
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="website"
                    id="website"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("website")}
                    onChange={e => setWebsite(e.target.value)}
                    value = {website}
                  />
                  <p className="text-[10px] text-red-900">
                    {errors?.website &&
                      errors.website.message}{" "}
                  </p>

                  <label
                    htmlFor="registrationnumber"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Company Website:
                  </label>
                </div>
              </div>
              </div>
             
    </div>
    <div className='flex justify-center align-middle'><button className='p-2 bg-amber-900 text-white rounded-xl ' type="submit"> Submit </button></div>
    
    </form> ) : null }

    <div className="mt-32"><FooterComponent  /></div>
    </>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default Vendoredit
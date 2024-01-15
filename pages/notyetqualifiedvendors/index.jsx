import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import HeaderComponent from "../../components/HeaderComponent";

import Tablecomponent from "../../components/Tablecomponentsim";

import FooterComponent from "../../components/FooterComponent";
import Link from "next/link";

import {
  TrashIcon,
  CheckCircleIcon,
  LightBulbIcon,
} from "@heroicons/react/solid";

import { getSession } from "next-auth/react";

import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useFilters,
  useSortBy,
} from "react-table";

function index() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);

  const onErrors = (errors) => console.error(errors);

  const columns = useMemo(
    () => [
      {
        Header: "Vendor Name",
        accessor: "vendorname",
        Cell: (props) => (
          <div className="flex justify-between">
            <p className="text-teal-800 text-[12px] font-Lato font-bold uppercase">
              {props.row.original.vendorname}
            </p>
          </div>
        ),

        // Filter: SelectColumnFilter,
      },
      {
        Header: "Vendor Code",
        accessor: "vendorcode",
        Cell: (props) => (
          <div className="flex justify-between">
            <p className="text-purple-900 text-[12px] font-semibold">
              {props.row.original.vendorcode}
            </p>
          </div>
        ),
      },

      {
        Header: "Vendor Address",
        accessor: "address",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3" > Country:</span>
              {props.row.original.address.countrycode}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3" > City:</span>
              {props.row.original.address.city}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3" > Address1: </span>{props.row.original.address.address1}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Address2:</span>{props.row.original.address.address2}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> Zipcode:</span>
              {props.row.original.address.zipcode}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> PO Box: </span>
              {props.row.original.address.pobox}
            </p>
          </div>
        ),
      },

      {
        Header: "Vendor Company details",
        accessor: "taxnumber",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> TAX Number: </span>{props.row.original.taxnumber}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> CR Number: </span>{props.row.original.companyregistrationnumber}
            </p>
            <p className="text-teal-800 text-[12px]">
              <span className="font-lato font-semibold mr-3"> email: </span>{props.row.original.companyemail}
            </p>
          </div>
        ),
      },

      {
        Header: "Contact salesperson:",
        accessor: "contact",
        Cell: (props) => (
          <div className="flex flex-col justify-between">
            <p className="text-stone-800 text-[12px] uppercase font-semibold">
              {props.row.original.contact?.salesname}
            </p>
            <p className="text-teal-800 text-[12px]">
              {props.row.original.contact?.salesemail}
            </p>
            <p className="text-sky-800 text-[12px] italic font-bold pb-2">
              {props.row.original.contact?.salesmobile}
            </p>
            <p className="text-teal-800 text-[12px] ">
              <span className="mr-2 font-bold"> Telephone: </span>{props.row.original.contact?.telelphone1}
            </p>
            <p className="text-teal-800 text-[12px] ">
              <span className="mr-2 font-bold"> Telephone:</span>{props.row.original.contact?.telephone2}
            </p>
            <p className="text-teal-800 text-[12px] ">
              <span className="mr-2 font-bold"> Fax: </span>{props.row.original.contact?.fax}
            </p>
          </div>
        ),
      },
    ],

    // ],
    []
  );

  const [vendorslist, setVendorslist] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/registeredvendors`);
      const json = await result.json();

      setVendorslist(json);
    })();
  }, []);

  console.log(vendorslist);

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <>
      <HeaderComponent />
      <div className="mb-5">
        <form onSubmit={handleSubmit(onSubmit, onErrors)}>
          <div className="w-10/12 bg-slate-100 px-3 pb-2 mx-auto">
            <h3 className="mx-auto text-white bg-red-600 mt-1 text-[12px] tracking-widest">
              {" "}
              Note: Please Register Vendor only after pre-qualifiying by MMD
              Manager.
            </h3>
            <div className="pt-5 m-3 grid md:grid-cols-3 md:gap-6">
              {/* 1st column */}
              <div className="flex flex-col bg-slate-100 p-3 border-r-4 border-slate-400/20 shadow-slate-400 shadow-md">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="vendorName"
                    id="vendorName"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("vendorName", {
                      required: "Vendor name is required",
                    })}
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
                    name="vendorCountry"
                    id="vendorCountry"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("vendorCountry", {
                      required: "Country code is required",
                    })}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.vendorCountry && errors.vendorCountry.message}{" "}
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
                    name="vendorCity"
                    id="vendorCity"
                    className="block py-2.5 px-0 w-1/2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("vendorCity", {
                      required: "Vendor's Head office City is required",
                    })}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.vendorCity && errors.vendorCity.message}{" "}
                  </p>

                  <label
                    htmlFor="address2"
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
                    {...register("address1", {
                      required: "Address 1st Line is required",
                    })}
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
                    {...register("address2", {
                      required: "Vendor Address 2nd Line is required",
                    })}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.address2 && errors.address2.message}{" "}
                  </p>

                  <label
                    htmlFor="vendorName"
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
              <div className="flex flex-col border-r-4 border-teal-400/20 shadow-teal-200 shadow-md bg-teal-100 p-3">
                <div className="relative z-0 w-1/2 mb-6 group">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="block py-2.5 px-0 w-full text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("email")}
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
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    className="block py-2.5 px-0 w-1/2 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("telephone1", {
                      required: "Telephone is required",
                    })}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.telephone1 && errors.telephone1.message}{" "}
                  </p>

                  <label
                    htmlFor="telephone1"
                    className="peer-focus:font-semibold absolute text-[14px] text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Telephone Number (123-456-7890):
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="telephone2"
                    id="telephone2"
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    className="block py-2.5 px-0 w-1/2 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("telephone2")}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.telephone2 && errors.telephone2.message}{" "}
                  </p>

                  <label
                    htmlFor="telephone2"
                    className="peer-focus:font-medium absolute text-sm text-teal-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Alternate Telephone Number (123-456-7890):
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="faxnumber"
                    id="faxnumber"
                    className="block py-2.5 px-0 w-1/2 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("faxnumber")}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.faxnumber && errors.faxnumber.message}{" "}
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
                    name="salesperson"
                    id="salesperson"
                    className="block py-2.5 px-0 w-2/3 text-sm text-teal-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("salesperson", {
                      required: "Salesperson is required",
                    })}
                  />

                  <p className="text-[10px] text-red-900">
                    {errors?.salesperson && errors.salesperson.message}{" "}
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
                    {...register("salesemail", {
                      required: "Salesperson's email  is required",
                    })}
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
                    {...register("salesmobile", {
                      required: "Salesperson's Mobile is required",
                    })}
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
              <div className="bg-sky-100 p-3 border-r-4 border-sky-500 shadow-md shadow-sky-500">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="taxnumber"
                    id="taxnumber"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("taxnumber", {
                      required: "TAX (VAT) Number is required",
                    })}
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
                    name="registrationnumber"
                    id="registrationnumber"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    {...register("registrationnumber", {
                      required: "Company registration number is required",
                    })}
                  />
                  <p className="text-[10px] text-red-900">
                    {errors?.registrationnumber &&
                      errors.registrationnumber.message}{" "}
                  </p>

                  <label
                    htmlFor="registrationnumber"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Company Registration number:
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-around align-middle">
              <button
                type="submit"
                className="bg-red-900  text-white p-1 rounded-md shadow-md shadow-red-200"
              >
                Exit/Cancel
              </button>
              <button
                type="submit"
                className="bg-green-900  text-white p-1 rounded-md shadow-md shadow-green-200"
              >
                Submit
              </button>
            </div>
          </div>

          {/* include validation with required or other standard HTML validation rules */}
        </form>
      </div>

      <div className="w-11/12 flex flex-col justify-center mx-auto">
        <Tablecomponent columns={columns} data={vendorslist} />
      </div>

      <FooterComponent />
    </>
  );
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

export default index;

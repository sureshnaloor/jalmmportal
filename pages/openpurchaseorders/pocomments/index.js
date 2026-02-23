import React, { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
// import Navigationcomp from '../../../components/Navigationcomponent';
import Headercomponent from "../../../components/HeaderComponent";

import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";

import dynamic from "next/dynamic";


import Footercomponent from "../../../components/FooterComponent";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import moment from 'moment'

const ReactQuill = dynamic(import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function Pocomments() {
  const router = useRouter();
  const { ponumber } = router.query;

  const { data: session } = useSession();

  const [comment, setComment] = useState("");

  const handleaddcomment = async (e) => {
    console.log(" will now put into mongodb the comments for purchaseorder");
    console.log(ponumber, title, comment);
    e.preventDefault();
    let body = {
      title,
      comment,
      user: session.user.name,
    };

    const result = await fetch(
      `/api/purchaseorders/openpo/comments/${ponumber}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      }
    );

    toast.success("commented succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    // router.push(`/notyetqualifiedvendors`);
    router.back();
  };
  const [title, setTitle] = useState("");

  const [comments, setComments] = useState([]);

  // fetch earlier comments

  useEffect(() => {
    (async () => {
      const result = await fetch(
        `/api/purchaseorders/openpo/comments/${ponumber}`
      );
      const json = await result.json();
      setComments(json);
    })();
  }, []);

  console.log(comments);
  // Debug: Log the date values to see what's being received
  comments.forEach((comment, index) => {
    console.log(`Comment ${index}:`, {
      title: comment.title,
      updatedBy: comment.updatedBy,
      rawUpdatedAt: comment.updatedAt,
      parsedDate: moment.utc(comment.updatedAt).local().format("DD-MM-YYYY HH:mm"),
      originalFormat: moment(comment.updatedAt).format("DD-MM-YYYY HH:mm")
    });
  });
  return (
    <div>
      {/* <Navigationcomp />  */}
      <Headercomponent />
      <div className="relative pb-6 mb-3 overflow-hidden rounded-lg shadow-lg cursor-pointer m-4 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-2"></div>
      <h3 className="font-bold tracking-wider uppercase text-[12px] mx-auto w-1/2"> Correspondences on the PO {ponumber} </h3>

      {/* earlier comments */}
     <div>
      {comments?.length > 0 ? (
        <div className="w-5/6 border-y-1 border-zinc-200 shadow-xl p-3 shadow-zinc-400 mx-auto">
            {comments.map((comment, index) => (
              <div key={index} className="w-full grid grid-cols-12 border-y-1 border-stone-600 shadow-xl shadow-stone-300 my-5 py-3 px-6 bg-stone-100/50"> 
                <p className="col-span-2 text-[12px] font-bold text-teal-700 tracking-wider uppercase italic">{comment.title}</p>
                <p className="col-span-8 text-[12px] font-Lato text-stone-900" dangerouslySetInnerHTML = {{__html: comment.comment}}></p>
                <div className="col-span-2 text-[10px] font-semibold italic flex justify-end flex-col">
                <h3 className="font-bold tracking-widest">{comment.updatedBy}</h3>
                <h3 className="text-sky-900 tracking-widest">{moment.utc(comment.updatedAt).local().format("DD-MM-YYYY HH:mm")} </h3>
                </div>
              
              </div>
            ))}

          </div>
      ) : (
        <p className="bg-pink-100 min-w-3/4 min-h-1/2 text-white"> No comments so far </p>
      )}

     </div>

      {/* for new comments */}

      <div>
        <form onSubmit={handleaddcomment}>
          <div className="w-1/2 bg-sky-50 mx-auto mt-5 border-t-2 border-sky-200 shadow-md shadow-sky-100">
            <span className="border-b-2 uppercase font-semibold border-emerald-800 text-[12px]">
              {" "}
              Title:{" "}
            </span>
            <input
              type="text"
              name="title"
              id="title"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
              onBlur={(e) => {
                setTitle(
                  (prev, current) => (current = prev + " " + e.target.value)
                );
              }}
            />
          </div>
          <div className="w-1/2 mx-auto">
            <span className="border-b-2 uppercase font-semibold border-emerald-800 text-[12px] mb-3">
              {" "}
              Brief comments/feedback:{" "}
            </span>
            <ReactQuill
              value={comment}
              onChange={(comment) => setComment(comment)}
              modules={{
                toolbar: [
                  ["bold", "italic", "underline"],
                  [{ color: [] }],

                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
                ],
              }}
              theme="snow"
              className="bg-slate-50 border-2 border-slate-500 min-h-[200px] mt-3"
            />
            <button
              type="submit"
              className=" mt-3 text-[10px] bg-emerald-800 p-2 rounded-xl text-white"
            >
              {" "}
              Submit comment
            </button>
          </div>
        </form>
      </div>
      <div className="mt-40">
        <Footercomponent />
      </div>
    </div>
  );
}

export default Pocomments;

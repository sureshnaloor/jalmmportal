import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import moment from 'moment'

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderComponent from "../../../components/HeaderComponent";

const ReactQuill = dynamic(import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

function Vendorcomments() {
  const { data: session } = useSession();
  const router = useRouter();
  const { vendor } = router.query;

  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");

  const [comments, setComments] = useState([]);

  const handleaddcomment = async (e) => {
    console.log(" will now put into mongodb the comments for vendor");
    console.log(vendor, title, comment);
    e.preventDefault()
    let body = {
      title,
      comment,
      user: session.user.name,
    };

    const result = await fetch(`/api/registeredvendors/comment/${vendor}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    });

    toast.success("commented succesfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });

    // router.push(`/notyetqualifiedvendors`);
    router.back()
  };

  // fetch earlier comments
  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/registeredvendors/comment/${vendor}`);
      const json = await result.json();
      setComments(json);
    })();
  }, []);

  console.log(comments)

  return (
    <>
      <HeaderComponent />
      <p className="w-1/2 mx-auto text-[14px] font-bold uppercase border-b-4 border-b-sky-800"> comments page for the vendor: {vendor} </p>
      <div className="w-1/2 mx-auto mt-3 bg-sky-600/80 py-3 shadow-md shadow-stone-400 text-white flex justify-center ">
        {" "}
        <h4 className="text-[14px]"> earlier comments </h4>
      </div>

      <div>
        {
          comments.length > 0 ? (
            <div>
        <table className="w-1/2 border-collapse border border-sky-500  mt-5 mx-auto">
          <thead>
            <tr className="bg-stone-200/50 text-zinc-900 border-b-2 border-slate-600">
              <th className="w-1/5 py-2 px-4 text-left text-[12px] border-r-2">Title</th>
              <th className="w-3/5 py-2 px-4 text-left text-[12px]">Comment</th>
              <th className="w-1/5 py-2 px-4 text-left text-[12px]">By/date</th>
            </tr>
          </thead>

          <tbody>
            {comments?.map((comment, index) => (
              <tr key={index} className="bg-white border-b border-blue-500">
                <td className="w-1/4 py-2 px-4 text-[12px] font-black text-zinc-800"> {comment.title}</td>
                <td className="w-3/4 py-2 px-4 text-[11px] font-bold text-stone-600" dangerouslySetInnerHTML = {{__html: comment.comment}} ></td>
                <td className="w-3/4 py-2 px-4 text-[11px] font-bold text-stone-600"> <span className="italic font-bold uppercase">{comment.updatedBy}</span> <br /> <span className="font-bold text-zinc-900 italic"> {moment(comment.updatedA).format("DD/MM/YYYY")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

          )
: (
  <p className="w-1/2 mx-auto flex justify-center mt-3 text-[12px] font-bold tracking-widest"> NIL </p>
)}        
      
      </div>

      <div className="w-1/2 mx-auto mt-3 bg-sky-600/80 py-3 shadow-md shadow-stone-400 text-white flex justify-center ">
        {" "}
        <h4 className="text-[14px]"> For new comment/feedback: </h4>
      </div>

      <form onSubmit={handleaddcomment}>
        <div className="w-1/2 bg-sky-50 mx-auto mt-5 border-t-2 border-sky-200 shadow-md shadow-sky-100">
        <span className="border-b-2 uppercase font-semibold border-emerald-800 text-[12px]"> Title: </span>
      <input
        type="text"
        name="title"
        id="title"
        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        placeholder=" "
        required
        onBlur={(e) => {
          setTitle((prev, current) => (current = prev + " " + e.target.value));
        }}
      />
    

      </div>
     <div className="w-1/2 mx-auto">
     <span className="border-b-2 uppercase font-semibold border-emerald-800 text-[12px] mb-3"> Brief comments/feedback: </span>
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
      <button type="submit" className=" mt-3 text-[10px] bg-emerald-800 p-2 rounded-xl text-white"> Submit comment</button>
      </div>
      </form>

      <div>
    
      </div>
    </>
  );
}

export default Vendorcomments;

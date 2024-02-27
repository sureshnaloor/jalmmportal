import React, {useRef, useState, useEffect} from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import parse from 'html-react-parser';
import { useRouter } from "next/router";

function VendorevalRemarks({vendornumber}) {
    const editorRef = useRef(null);
    const router = useRouter();

    const [formData, setFormData] = useState("")
    const [textContent, setTextContent] = useState('')

    useEffect(() => {
      const fetchContent = async () => {
        const response = await fetch(
          `/api/vendors/vendorevalremarks/${vendornumber}`
        );
        const json = await response.json();
        setTextContent(json);
        
      };
      fetchContent();
    }, [vendornumber]);

    const handleEditorChange = (content, editor) => {
      setFormData({ ...formData, description: content });
      let contentdisplay = editorRef.current.getContent();
        setTextContent(contentdisplay)
    }
  return (
    <div className="bg-zinc-100 mx-auto w-5/6 drop-shadow shadow-lg shadow-stone-800 mb-9">
    <div className="w-1/2 mb-3 py-1 shadow-lg text-[14px] shadow-slate-200 mx-auto my-auto mt-2 bg-emerald-100/80 text-stone-800 font-bold font-italic tracking-widest">
      {" "}
      <h3 className='flex justify-center'>The Evaluation Remarks for vendor code: {vendornumber}</h3>
    </div>
    {
      textContent["remarks"] ? 

      (
        <p className='p-5'>
          { parse(textContent["remarks"])}
        </p>
      )
        
       :
      (
        <form onSubmit={async (e) => {
          e.preventDefault()
          console.log(formData)
          await fetch(
              `/api/vendors/vendorevalremarks/${vendornumber}`,
              {
                method: "PUT",
                body: JSON.stringify(formData),
                headers: new Headers({
                  "Content-Type": "application/json",
                  Accept: "application/json",
                }),
              }
            );           
            
  
            toast.success(
              `The vendor evaluation remarks for the vendor ${vendornumber} is updated, thanks!`,
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );

            router.reload();
      
      }
  }>
      <Editor
          onInit={(evt, editor) => editorRef.current = editor}
          // there's a known issue with how tinymce works where the intialValue and value
          // come into conflict when using useState. tinymce recommend removing initialValue
          // and setting the initial value as the the default state value i.e. formData.description
          // is set to the placeholder text instead of just an empty string
          // initialValue="<p>This is the initial content of the editor.</p>"
          apiKey="uskwux5r0ibqgrrmdugvj4zk2jr3j3ftxj7t2k67vepofe2z"
          init={{
            height: 200,
            menubar: true,
            plugins: 'advlist autolink lists link image charmap preview anchor ' +
              'searchreplace visualblocks code fullscreen ' +
              'insertdatetime media table code help wordcount'
            ,
            toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
  
          
          value={formData.description}
          onEditorChange={handleEditorChange}
        />
        
         
        <button className='bg-emerald-400 text-white px-2 rounded-lg shadow-md shadow-slate-500 align-middle justify-end mb-2 ml-2'> Save</button>
        </form>
      )

    }
    
    </div>
  )
}

export default VendorevalRemarks
import React, {useState} from 'react'

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';

function VendorevalSpecialremarks({vendornumber}) {

    const [longDesc, setLongDesc] = useState('');

  return (
    

<div className="bg-zinc-100 mx-auto w-5/6 drop-shadow rounded-md mb-9">
      <h4 className="mb-3 py-3 shadow-lg shadow-slate-200 mx-auto my-auto bg-emerald-300 text-slate-800 font-bold font-italic tracking-widest">
        {" "}
        Special comments on vendor including their profile, performance, quality, materials and services dealt: {vendornumber}
      </h4>

      <ReactQuill value={longDesc} onChange={(longDesc) => setLongDesc(longDesc)}
                   modules={{
                    toolbar: [
                      [{ font: [] }],
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ script:  "sub" }, { script:  "super" }],
                      ["blockquote", "code-block"],
                      [{ list:  "ordered" }, { list:  "bullet" }],
                      [{ indent:  "-1" }, { indent:  "+1" }, { align: [] }],
                      ["link", "image", "video"],
                      ["clean"],
                  ],
                  }}
                  theme="snow"
                  className="bg-slate-100 border-2 border-slate-800 min-h-[250px]"
                  placeholder='Please start writing on the vendor performance, quality, etc..... the textarea will resize as required, you can use above tags to style'
                  />
                  
    </div>
  )
}

export default VendorevalSpecialremarks
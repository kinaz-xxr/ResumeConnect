import { useEffect, useState } from "react"
import './Upload.css'; // Import the CSS file

export default function UploadPage() {

    const [uploadedFiles, setUploadedFiles] = useState<File>()

    useEffect(() => {
        if (uploadedFiles) {
            let formData = new FormData(); 
            formData.append('file', uploadedFiles)
            fetch('http://127.0.0.1:5000/upload',  {
                method: "POST", 
                body: formData, // body data type must match "Content-Type" header
              })
    
              console.log(uploadedFiles)
        }

    }, [uploadedFiles])
    return (
        <div>
            <h1 className="center-items">Welcome to <span className="blue-color"> ResumeNetwork</span>!</h1>
            <h3 className="center-item description">Need to share your resume to others and received feedback? But too lazy to change it?
                 We got you cover. We provide a resume sharing platform where you can share your resume, received feedback
                 and most importantly, get AI-generated updates. Simply upload the pdf file below, share the link to others and let the magic does the rest :)</h3>
            <form className="upload-form" encType="multipart/form-data">
                <label className="file-upload-label">
                    <input 
                        type="file" 
                        accept=".pdf" 
                        name='resume' 
                        className="file-input" 
                        onChange={(event) => setUploadedFiles(event.target.files![0])} 
                    />
                    Upload Resume
                </label>
            </form>
        </div>
    );
}
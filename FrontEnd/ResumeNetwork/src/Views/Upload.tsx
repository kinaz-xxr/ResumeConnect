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
            <h1>Welcome to <span className="blue-color">ResumeNetwork</span>!</h1>
            <h3></h3>
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
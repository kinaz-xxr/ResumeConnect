import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Upload.css'; 
import {CopyToClipboard} from 'react-copy-to-clipboard';


export default function UploadPage() {
    const [uploadedFiles, setUploadedFiles] = useState<File | null>(null);
    const [s3URL, setS3URL] = useState("");
    const [uuid, setUuid] = useState("")
    const [fileUploaded, setFileUploaded] = useState(false);
    const [copyStatus, setCopyStatus] = useState(false); 

    useEffect(() => {
        if (uploadedFiles) {
            let formData = new FormData(); 
            formData.append('file', uploadedFiles);
            fetch('http://127.0.0.1:5000/upload',  {
                method: "POST", 
                body: formData, // body data type must match "Content-Type" header
              })
              .then((response) => response.json())
              .then((data) => {
                setFileUploaded(true); // Set fileUploaded to true when URL is received
                setUuid(data["uuid"])
              });
        }
    }, [uploadedFiles]);


    const onCopyText = () => {
        setCopyStatus(true); // Set copy status to true when text is copied
        setTimeout(() => setCopyStatus(false), 2000); // Reset copy status after 2 seconds
    };

    return (
        <div>
            <h1 className="center-items">Welcome to <span className="blue-color"> Resume Connect</span>!</h1>
            <h3 className="center-item description">
                Need to share your resume to others and receive feedback? But too lazy to change it?
                We got you covered. We provide a resume sharing platform where you can share your resume, receive feedback,
                and most importantly, get AI-generated updates. Simply upload the LaTex file below, share the link with others and let the magic do the rest :)
            </h3>
            <form className="upload-form" encType="multipart/form-data">
                <label className="file-upload-label">
                    <input 
                        type="file" 
                        accept=".tex" 
                        name='resume' 
                        className="file-input" 
                        onChange={(event) => setUploadedFiles(event.target.files![0])} 
                    />
                    Upload Resume
                </label>
            </form>
            {fileUploaded && (
                <div className="popup">
                    <div className="popup-inner">
                        <h2>File Uploaded Successfully!</h2>
                        <div>
                        <p>
                            <CopyToClipboard text={`/comment?s3URL=${encodeURIComponent(s3URL)}`} onCopy={onCopyText}>
                                <button>Copy to Clipboard</button>
                            </CopyToClipboard>
                        </p>
                    
                        {copyStatus && <p>Text copied to clipboard!</p>}
                        </div>
                        <p>You can view and comment on your file <a href={`/comment?uuid=${uuid}`} target="_blank" rel="noopener noreferrer">here</a>.</p>
                        <button onClick={() => setFileUploaded(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

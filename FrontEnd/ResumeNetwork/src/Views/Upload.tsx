import { useEffect, useState } from "react";
import './Upload.css'; // Import the CSS file
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function UploadPage() {
    const [uploadedFiles, setUploadedFiles] = useState<File | null>(null);
    const [s3URL, setS3URL] = useState("");
    const [fileUploaded, setFileUploaded] = useState(false);

    const [textToCopy, setTextToCopy] = useState(''); // The text you want to copy
    const [copyStatus, setCopyStatus] = useState(false); // To indicate if the text was copied

    const onCopyText = () => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000); // Reset status after 2 seconds
    };

    useEffect(() => {
        if (uploadedFiles) {
            let formData = new FormData(); 
            formData.append('file', uploadedFiles)
            fetch('http://127.0.0.1:5000/upload',  {
                method: "POST", 
                body: formData, // body data type must match "Content-Type" header
              })
              .then((response) => response.json())
              .then((data) => {
                setS3URL(data["s3URL"]);
                setFileUploaded(true); // Set fileUploaded to true when URL is received
              })
        }

    }, [uploadedFiles]);

    return (
        <div>
            <h1 className="center-items">Welcome to <span className="blue-color"> ResumeNetwork</span>!</h1>
            <h3 className="center-item description">
                Need to share your resume to others and receive feedback? But too lazy to change it?
                We got you covered. We provide a resume sharing platform where you can share your resume, receive feedback,
                and most importantly, get AI-generated updates. Simply upload the PDF file below, share the link with others and let the magic do the rest :)
            </h3>

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
            {fileUploaded && (
                <div className="popup">
                    <div className="popup-inner">
                        <h2>File Uploaded Successfully!</h2>
                        <div>
                        <p>
                            <CopyToClipboard text={s3URL} onCopy={onCopyText}>
                                <button>Copy to Clipboard</button>
                            </CopyToClipboard>
                        </p>
                    
                        {copyStatus && <p>Text copied to clipboard!</p>}
                        </div>
                        <button onClick={() => setFileUploaded(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

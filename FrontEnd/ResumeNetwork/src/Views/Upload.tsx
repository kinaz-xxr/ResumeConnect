import { useEffect, useState } from "react"

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
    return(
        <form encType="multipart/form-data">
            <input type="file" accept=".pdf" name='resume' onChange={(event) => setUploadedFiles(event.target.files![0])} />
        </form>
    )
}
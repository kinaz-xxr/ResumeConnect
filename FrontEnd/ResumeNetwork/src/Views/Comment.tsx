import { ReactElement, useEffect, useRef, useState } from "react";
import './Comment.css'; 
import { useLocation } from "react-router-dom";
import { Viewer } from '@react-pdf-viewer/core';

interface Comment {
    text: string;
    checked: boolean;
}

export default function UploadPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [renderedComments, setRenderedComments] = useState<ReactElement[]>([]);
    const [resumeUUID, setResumeUUID] = useState("");
    const [pdfBlob, setPdfBlob] = useState<Blob>();

    useEffect(() => {
        const uuidParam = searchParams.get('uuid');
        setResumeUUID(uuidParam || "");
    }, [searchParams]);

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const newComment = e.target[0].value;
        setComments([...comments, { text: newComment, checked: false }]);

        if (formRef.current) {
            formRef.current.reset();
        }
    }

    const handleCheckboxChange = (index: number) => {
        const newComments = comments.map((comment, i) => (
            i === index ? { ...comment, checked: !comment.checked } : comment
        ));
        setComments(newComments);
    }

    useEffect(() => {
        if (resumeUUID) {
            const url = `http://127.0.0.1:5000/getS3URL?uuid=${resumeUUID}`;
            
            fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                // Return the response as blob
                return response.blob();
            })
            .then(blob => {
                // Set the PDF blob state to render the PDF in the component
                setPdfBlob(blob);
            })
            .catch(error => {
                console.error(`Error fetching PDF data: ${error}`);
            });
        }
    }, [resumeUUID]);

    useEffect(() => {
        setRenderedComments(comments.map((comment, index) => {
            const key_id = `${comment.text}-${index}`;
            return (
                <div className="item" key={key_id}>
                    <input 
                        type="checkbox" 
                        checked={comment.checked} 
                        onChange={() => handleCheckboxChange(index)} 
                    />
                    {comment.text}
                </div>
            );
        }));
    }, [comments]);

    return (
        <div className="upload-page">
            <div className="pdf-viewer">
            {pdfBlob && (
                <iframe
                    src={URL.createObjectURL(pdfBlob)}
                    width="100%"
                    height="500px"
                    title="PDF Document"
                />
            )}
            </div>
            <div className="comment-section">
                <h2>Comments</h2>
                <ul>{renderedComments}</ul>
                <div className="comments">
                    <form onSubmit={onFormSubmit} ref={formRef} className="commentForm"> 
                        <input type="text" id="name" />
                    </form>
                </div>
                <button className="button-color">Download</button>
            </div>
        </div>
    );
}

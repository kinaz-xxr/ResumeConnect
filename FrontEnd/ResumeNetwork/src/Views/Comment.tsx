import { ReactElement, useEffect, useRef, useState } from "react";
import './Comment.css'; 
import { useLocation } from "react-router-dom";
import { Viewer } from '@react-pdf-viewer/core';
import Loading from './Loading';

interface Comment {
    content: string;
    checked: boolean;
}

export default function UploadPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [renderedComments, setRenderedComments] = useState<ReactElement[]>([]);
    const [resumeUUID, setResumeUUID] = useState("");
    const [pdfBlob, setPdfBlob] = useState<Blob>();
    const [isLoading, setIsLoading] = useState(false); 
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const uuidParam = searchParams.get('uuid');
        setResumeUUID(uuidParam!!);
        fetch("http://127.0.0.1:5000/get_comments?uuid=" + uuidParam)
        .then(response => response.json())
        .then(prevComments => {
            setComments([...prevComments["data"], ...comments])
            return true
            })
    }, []);

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const newComment = e.target[0].value;
        setComments([...comments, { content: newComment, checked: false }]);

        if (formRef.current) {
            formRef.current.reset();
        }

        fetch("http://127.0.0.1:5000/add_comments", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            method: "POST", 
            body: JSON.stringify({"comment": newComment, "resumeId": resumeUUID})
        })
    }

    const handleCheckboxChange = (index: number) => {
        const newComments = comments.map((comment, i) => (
            i === index ? { ...comment, checked: !comment.checked } : comment
        ));
        setComments(newComments);
    }

    const getRecommendations = () => {
        setIsLoading(true); 
        const checkedComments = comments.filter((comment) =>comment.checked === true)
        fetch("http://127.0.0.1:5000/process", {
            method: "POST", 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({"comments": checkedComments.map(comments => comments.content), "resume_uuid": resumeUUID})
        }).then( res => res.blob() )
        .then( blob => {
          var file = window.URL.createObjectURL(blob);
          setIsLoading(false); 
          window.open(file, '_blank');
        })
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
            const key_id = `${comment.content}-${index}`;
            return (
                <div className={isLoading ? "item_disabled" :"item"} key={key_id}>
                    <input 
                        type="checkbox" 
                        className={isLoading ? "disabled" : ""}
                        checked={comment.checked} 
                        onChange={() => handleCheckboxChange(index)} 
                    />
                    {comment.content}
                </div>
            );
        }));
    }, [comments, isLoading]);

    return (
        <div className="upload-page">
            <div className="pdf-viewer">
            {pdfBlob && (
                <iframe
                    src={URL.createObjectURL(pdfBlob)+ "#toolbar=0&navpanes=0&scrollbar=0"}
                    width="100%"
                    height="100%"
                    title="PDF Document"
                />
            )}
            </div>
            <div className="comment-section">
                <h2>Comments</h2>
                {isLoading ? <Loading /> : null}
                <ul>{renderedComments}</ul>
                <div>
                    <div className="comments">
                        <form onSubmit={onFormSubmit} ref={formRef} className="commentForm"> 
                            <input type="text" id="name" />
                        </form>
                    </div>
                    <button className={isLoading ? "disabled" : "button-color"} onClick={getRecommendations}>Download</button>
                </div>
            </div>

        </div>
    );
}

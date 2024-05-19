import { ReactElement, useEffect, useState } from "react";
import './Comment.css'; 
import { useLocation } from "react-router-dom";
import { ScrollMode, Viewer } from '@react-pdf-viewer/core';
import { CommentSection } from 'replyke';


export default function UploadPage() {

    const [submitting, setSubmitting] = useState(false)
    const [comments, setComments] = useState<string[]>([])
    const [renderedComments, setRenderedComments] = useState<ReactElement[]>([])
    const [resumeUUID, setResumeUUID] = useState("");
    const [s3URL, setS3URL] = useState("");

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const uuidParam = searchParams.get('uuid');
        (uuidParam!!);
        setResumeUUID(uuidParam!!);
    }, []);

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation();

        setComments([...comments, e.target[0].value])

    }

    useEffect(() => {
        if (resumeUUID) {
            const url = `http://127.0.0.1:5000/getS3URL?uuid=${resumeUUID}`;
            fetch(url)
                .then(response => {
                    if(!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    setS3URL(data["s3URL"]);
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                });
        }

    }, [resumeUUID]);

    useEffect(() => {
        setRenderedComments(comments.map((comment: string) => {
            const key_id =  !(comment in comments)?  comment : comment + "(1)"
            return <div key={key_id}>{comment}</div>
        }))
    }, [comments])


    return (
        <div className="upload-page">
            <div className="pdf-viewer">
    {s3URL ? <Viewer fileUrl={s3URL}/> : null}
            </div>
            <div className="comment-section">
                <h2>Comments</h2>
                <ul>{...renderedComments}</ul>
                <div className="comments">
                <form onSubmit={(e) => onFormSubmit(e)} className="commentForm"> 
                    <input type="text" id="name"></input>
                </form>
                </div>
            </div>
        </div>
    );
}

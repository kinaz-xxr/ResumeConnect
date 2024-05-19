import { ReactElement, useEffect, useState } from "react";
import './Comment.css'; 
import { useLocation } from "react-router-dom";
import { ScrollMode, Viewer } from '@react-pdf-viewer/core';
import { CommentSection } from 'replyke';


export default function UploadPage() {

    const [submitting, setSubmitting] = useState(false)
    const [comments, setComments] = useState<string[]>([])
    const [renderedComments, setRenderedComments] = useState<ReactElement[]>([])

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [resumeUuid, setResumeUuid] = useState(searchParams.get('uuid'))
    const s3URL = searchParams.get('s3URL');

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation();

        setComments([...comments, e.target[0].value])

    }

    const getComments = async() => {
        console.log(resumeUuid)
    }

    useEffect(() => {
        console.log(s3URL)
        getComments()
    }, [resumeUuid])

    useEffect(() => {
        setRenderedComments(comments.map((comment: string) => {
            const key_id =  !(comment in comments)?  comment : comment + "(1)"
            return <div key={key_id}>{comment}</div>
        }))
    }, [comments])


    return (
        <div className="upload-page">
            <div className="pdf-viewer">
    <Viewer fileUrl={s3URL!}/>
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

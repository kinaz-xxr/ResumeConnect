import { useEffect, useState } from "react";
import './Comment.css'; 
import { useLocation } from "react-router-dom";
import { ScrollMode, Viewer } from '@react-pdf-viewer/core';

export default function UploadPage() {

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const s3URL = searchParams.get('s3URL');


    return (
        <div className="upload-page">
            <div className="pdf-viewer">
    <Viewer fileUrl={s3URL!}/>
            </div>
            <div className="comment-section">
                <h2>Comments</h2>
                <div className="comments">
                    <p>This is a comment.</p>
                </div>
            </div>
        </div>
    );
}

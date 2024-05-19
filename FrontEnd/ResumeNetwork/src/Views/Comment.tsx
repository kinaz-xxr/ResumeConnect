import { useEffect, useState } from "react";
import './Comment.css'; 

export default function UploadPage() {
    return (
        <div className="upload-page">
            <div className="pdf-viewer">
                <embed src="path/to/your/pdf.pdf" type="application/pdf" width="100%" height="100%"/>
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

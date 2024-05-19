import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./Views/Upload";
import CommentPage from "./Views/Comment";
import './App.css'
import { Worker } from '@react-pdf-viewer/core';
function App() {

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<UploadPage/>}/>
        <Route path="/comment" element={<CommentPage/>}/>
      </Routes>
    </BrowserRouter>
  </Worker>

  )
}

export default App

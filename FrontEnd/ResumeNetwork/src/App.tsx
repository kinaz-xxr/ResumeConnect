import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./Views/Upload";
import CommentPage from "./Views/Comment";
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<UploadPage/>}/>
        <Route path="/comment" element={<CommentPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

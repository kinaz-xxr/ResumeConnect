import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./Views/Upload"
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<UploadPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

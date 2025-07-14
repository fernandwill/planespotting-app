// client/App.jsx

import { useEffect, useState, useRef } from "react";
import "./App.css"
import {FaTrashAlt} from "react-icons/fa";

function App () {
  
  // State and refs

  const [photos, setPhotos] = useState([])
  const [file, setFile] = useState(null)
  const [alt, setAlt] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef()
  const [desc, setDesc] = useState("")
  const [watermark, setWatermark] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Fetch photos on load

  useEffect(() => {
    // This is to fetch photo from the backend API
    fetch("http://localhost:773/api/photos")
    .then(res => res.json())
    .then(data => setPhotos(data))
    .catch(err => console.error("Error fetching photos", err))
  }, [])

  // File select

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Handle upload

  const handleUpload = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("images", selectedFile)
    formData.append("alt", alt)
    formData.append("description", desc)
    formData.append("watermark", watermark)

    const res = await fetch("http://localhost:773/upload", {
      method: "POST",
      body: formData
    })

    if (res.ok) {
      const data = await res.json()
      setPhotos(prev => [...prev, {
        filename: data.filename,
        alt,
        description: desc
      }])
      setSelectedFile("null")
      setAlt("")
      setDesc("")
      setWatermark(false)
    } else {
      alert("Upload failed.")
    }
  }

  // Hold filename that is being deleted
  const [deleting, setDeleting] = useState(null) 

  const handleDelete = async (filename) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?")
    if (!confirmDelete) return

    setDeleting(filename) // Mark as deleting

    const res = await fetch(`http://localhost:773/api/photos/${filename}`, {
      method: "DELETE"
    })

    if (res.ok) {
      setPhotos(prev => prev.filter(photo => photo.filename !== filename))
    } else {
      alert("Failed to delete photo.")
    }

    setDeleting(null) // Clear after done
  }

  return ( 
    <div className="app">
      <header>
        <h1>Fernand's Planespotting Gallery</h1>
        <p>Gallery of photos I have snapped of planes around the world.</p>
      </header>

      <input 
          type="file"
          ref={fileInputRef}
          accept="images/*"
          style={{ display: "none"}}
          onChange={handleFileSelect}
      />

      <button className="upload-btn" onClick={() => setShowModal(true)}>Upload</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Upload Photo(s)</h2>

            <input
            type="file"
            ref={fileInputRef}
            accept="images/*"
            onChange={handleFileSelect}
            />
            <input
            type="text"
            placeholder="Alt Text..."
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            required
            />
            <input
            type="text"
            placeholder="Description..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            />

            <label>
              <input
              type="checkbox"
              checked={watermark}
              onChange={(e) => setWatermark(e.target.checked)}
              />
              Add Watermark
            </label>

            <div className="modal-actions">
              <button className="modal-upload" onClick={handleUpload}>Upload</button>
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <section className="gallery">
        <h2>Sample Photos</h2>
        <div className="photo-grid">
          {/* .map() through photos array used above and display each photo with their details */}
          {photos.map(photo => (
            <div key={photo.id} className="photo-card">
              <div className="photo-wrapper">
            <img
            key={photo.id}
            src={`http://localhost:773/images/${photo.filename}`}
            alt={photo.alt}
            />
            {deleting === photo.filename ? (
              <span className="del-text">Deleting...</span>
            ) : (
            <button className="delete-btn" data-testid="del-btn" onClick={() => handleDelete(photo.filename)}><FaTrashAlt size={16}/></button>
            )}
            </div>
            <p>{photo.alt}</p>
          </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
// client/App.jsx
import { useEffect, useState, useRef } from "react"
import "./App.css"
import { FaTrashAlt } from "react-icons/fa"
import { RxCross2 } from "react-icons/rx"
import { FiCheck } from "react-icons/fi"

function App() {
  const [photos, setPhotos] = useState([])
  const [file, setFile] = useState(null)
  const [alt, setAlt] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [desc, setDesc] = useState("")
  const [watermark, setWatermark] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right")
  const [deleting, setDeleting] = useState(null)
  const fileInputRef = useRef()
  const watermarkImage = "./watermark.png"
  const [zoomedPhoto, setZoomedPhoto] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch("http://localhost:773/api/photos")
      .then(res => res.json())
      .then(data => setPhotos(data))
      .catch(err => console.error("Error fetching photos", err))
  }, [])

  useEffect(() => {
    const handleKeyCombo = e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault() 
        setShowLoginModal(true)
      }
    }

    window.addEventListener("keydown", handleKeyCombo)
    return () => window.removeEventListener("keydown", handleKeyCombo)
  }, [])

  useEffect(() => {
    fetch("http://localhost:773/check-auth", {
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => setIsLoggedIn(data.loggedIn))
    .catch(() => setIsLoggedIn(false))
  }, [])

  const handleFileSelect = e => {
    const file = e.target.files[0]
    if (file) setSelectedFile(file)
  }

  const handleUpload = async e => {
    setShowConfirmationModal(false)
    e.preventDefault()

    if (!selectedFile) return alert("Please select a file before uploading.")

    const formData = new FormData()
    formData.append("images", selectedFile)
    formData.append("alt", alt)
    formData.append("description", description)
    formData.append("watermark", watermark)
    formData.append("position", watermarkPosition)

    const res = await fetch("http://localhost:773/upload", {
      method: "POST",
      body: formData
    })

    if (res.ok) {
      const data = await res.json()
      setPhotos(prev => [...prev, data.photo])
      setSelectedFile(null)
      setAlt("")
      setDesc("")
      setWatermark(false)
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 10000)
      setShowModal(false)
    } else {
      alert("Upload failed.")
    }
  }

  const handleDelete = async filename => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return

    setDeleting(filename)
    const res = await fetch(`http://localhost:773/api/photos/${filename}`, { method: "DELETE" })

    if (res.ok) setPhotos(prev => prev.filter(photo => photo.filename !== filename))
    else alert("Failed to delete photo.")

    setDeleting(null)
  }

  return (
    <div className="app">
      <header>
        <h1>My Planespotting Gallery</h1>
        <p>Gallery of photos I have snapped of planes around the world.</p>
      </header>

      {isLoggedIn && (
        <div className="logout-div">
          <button className="logout-btn"
          onClick={async () => {
            await fetch("http://localhost:773/logout", {
              method: "POST",
              credentials: "include",
            })
            setIsLoggedIn(false)
            alert("Logged out.")
            }}
          >Logout</button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="images/*"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      
      {isLoggedIn && (
        <button className="upload-btn" onClick={() => setShowModal(true)}>Upload</button>
      )}

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Login</h2>
            <p>Username</p>
            <input
            type="text"
            placeholder="Magic Word..."
            value={username}
            onChange={e => setUsername(e.target.value)}
            />
            <p>Password</p>
            <input
            type="text"
            placeholder="Magic Word..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            />
            <div className="modal-actions">
              <button
              onClick={async () => {
                const res = await fetch("http://localhost:773/login", {method: "POST", headers: {"Content-Type": "application/json"}, credentials: "include", body: JSON.stringify({username, password})
              })

              if (res.ok) {
                setIsLoggedIn(true)
                setShowLoginModal(false)
              } else {
                alert ("Login failed.")
              }
            }}>Login</button>
            <button
            onClick={() => setShowLoginModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Upload Photo</h2>
            <input type="file" ref={fileInputRef} accept="images/*" onChange={handleFileSelect} />

            {selectedFile && (
              <div className="preview-container">
                <h4>Preview:</h4>
                <div className="image-preview">
                  <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="preview-image" />
                  {watermark && <img src={watermarkImage} alt="Watermark" className={`watermark-preview ${watermarkPosition}`} />}
                </div>
              </div>
            )}

            <input type="text" placeholder="Alt Text..." value={alt} onChange={e => setAlt(e.target.value)} required />
            <input type="text" placeholder="Description..." value={desc} onChange={e => setDesc(e.target.value)} />

            <label>
              <input type="checkbox" checked={watermark} onChange={e => setWatermark(e.target.checked)} /> Add Watermark
            </label>

            {watermark && (
              <select value={watermarkPosition} onChange={e => setWatermarkPosition(e.target.value)}>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="center">Center</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            )}

            <div className="modal-actions">
              <button
                className="modal-upload"
                disabled={!selectedFile}
                onClick={() => setShowConfirmationModal(true)}>
                Upload
              </button>

              <button
                className="modal-cancel"
                onClick={() => {
                  setSelectedFile(null)
                  fileInputRef.current.value = null
                  setShowModal(false)
                  setAlt("")
                  setDesc("")
                  setWatermark(false)
                  setShowConfirmationModal(false)
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Watermark Preview</h3>
            <div className="image-preview">
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="preview-image" />
              {watermark && <img src={watermarkImage} alt="Watermark" className={`watermark-preview ${watermarkPosition}`} />}
            </div>
            <button onClick={() => setShowPreviewModal(false)}>Close</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Photo Uploaded!</h2>
            <p>Your photo has been successfully added to the gallery.</p>
            <button onClick={() => setShowSuccessModal(false)}>OK</button>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Upload</h2>
            <p>Are you sure you want to upload this photo?</p>
            <div className="modal-actions">
              <button onClick={handleUpload}><FiCheck size={16}/></button>
              <button onClick={() => setShowConfirmationModal(false)}><RxCross2 size={16}/></button>
            </div>
          </div>
        </div>
      )}

      {zoomedPhoto && (
        <div className="modal-overlay" onClick={() => setZoomedPhoto(null)}>
          <div className="zoom-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setZoomedPhoto(null)}><RxCross2 size={16}/></button>
            <img
            src={`http://localhost:773/images/${zoomedPhoto.filename}`}
            alt={zoomedPhoto.alt}
            className="zoomed-image"
            />
            {zoomedPhoto.description && (
              <p style={{ color: "#555", marginTop: "1rem" }}>{zoomedPhoto.description}</p>
            )}
          </div>
        </div>
      )}

      <section className="gallery">
        <h2>Showcase Gallery</h2>
        <div className="photo-grid">
          {photos
          .filter(photo => photo.filename && photo.alt && photo.id)
          .map(photo => (
            <div key={photo.id} className="photo-card">
              <div className="photo-wrapper">
                <img src={`http://localhost:773/images/${photo.filename}`} alt={photo.alt} onClick={() => setZoomedPhoto(photo)} style={{cursor: "zoom-in"}} />
                {deleting === photo.filename ? (
                  <span className="del-text">Deleting...</span>
                ) : (
                  <>
                  {isLoggedIn && (
                    <button className="delete-btn" data-testid="del-btn" onClick={() => handleDelete(photo.filename)}>
                      <FaTrashAlt size={16} />
                    </button>
                  )}
                  </>
                )}    
                <div className="photo-overlay">
                  {photo.description && <div className="overlay-text">{photo.description}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="footer">
        <footer>
          <p>© Fernand William Citra</p>
          <p>Made to showcase the engineering marvel of humanity.</p>
        </footer>
      </section>
    </div>
  )
}

export default App

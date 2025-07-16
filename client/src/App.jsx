// client/App.jsx
import { useEffect, useState, useRef } from "react"
import "./App.css"
import { FaTrashAlt } from "react-icons/fa"
import { RxCross2 } from "react-icons/rx"

function App() {
  const [photos, setPhotos] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [fadeClass, setFadeClass] = useState("show")
  const [alt, setAlt] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [desc, setDesc] = useState("")
  const [watermark, setWatermark] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState(null)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastHide, setToastHide] = useState(false)
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right")
  const [deleting, setDeleting] = useState(null)
  const fileInputRef = useRef()
  const watermarkImage = "./watermark.png"
  const [zoomedPhoto, setZoomedPhoto] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pageRefresh, setPageRefresh] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:773/api/photos?page=${currentPage}&limit=8`)
      .then(res => res.json())
      .then(data => {
        const padded = [...data.photos]
        while (padded.length < 8) {
          padded.push(null)
        }
        setPhotos(padded)
        setTotalPages(data.totalPages)
      })
      .catch(err => console.error("Error fetching photos", err))
  }, [currentPage, pageRefresh])

  useEffect(() => {
    const handleKeyCombo = e => {
      if (!isLoggedIn && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        setShowLoginModal(true)
      }
    }

    window.addEventListener("keydown", handleKeyCombo)
    return () => window.removeEventListener("keydown", handleKeyCombo)
  }, [isLoggedIn])

  useEffect(() => {
    fetch("http://localhost:773/check-auth", {
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
      console.log("Check-auth result:", data);
      setIsLoggedIn(data.loggedIn)
    })
    .catch(() => setIsLoggedIn(false))
  }, [])

  const showToastMsg = (message, duration = 5000) => {
    setToastMessage(message)
    setToastVisible(true)
    setToastHide(false)

    setTimeout(() => setToastHide(true), duration - 500)
    setTimeout(() => setToastVisible(false), duration)
  }

  const handlePageChange = (newPage) => {
    setFadeClass("fade")
    setTimeout(() => {
      setCurrentPage(newPage)
      setFadeClass("show")
    }, 300)
  }

  const handleFileSelect = e => {
    const file = e.target.files[0]
    if (file) setSelectedFile(file)
  }

  const handleUpload = async e => {
    setShowConfirmationModal(false)
    e.preventDefault()

    if (!selectedFile) return showToastMsg("Please select a file before uploading.")

    const formData = new FormData()
    formData.append("images", selectedFile)
    formData.append("alt", alt)
    formData.append("description", desc)
    formData.append("watermark", watermark)
    formData.append("position", watermarkPosition)

    const res = await fetch("http://localhost:773/upload", {
      method: "POST",
      body: formData,
      credentials: "include"
    })

    if (res.ok) {
      const data = await res.json()
      setPhotos(prev => [...prev, data.photo])
      setSelectedFile(null)
      setAlt("")
      setDesc("")
      setWatermark(false)
      setShowSuccessModal(true)
      setPageRefresh(prev => !prev)
      setTimeout(() => setShowSuccessModal(false), 10000)
      setShowModal(false)
    } else {
      showToastMsg("Upload failed.")
    }
  }

  const handleDelete = async filename => {
    setDeleting(filename)
    const res = await fetch(`http://localhost:773/api/photos/${filename}`, { method: "DELETE", credentials: "include" })
  
    if (res.ok) {
      setPhotos(prev => prev.filter(photo => photo.filename !== filename ))
      setPageRefresh(prev => !prev)
    } else showToastMsg("Failed to delete photo.")
  
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
            setPageRefresh(prev => !prev)
            setIsLoggedIn(false)
            showToastMsg("Logged out.")
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
            type="password"
            placeholder="Magic Word..."
            value={username}
            onChange={e => setUsername(e.target.value)}
            />
            <p>Password</p>
            <input
            type="password"
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
                showToastMsg("Login success.")
                setShowLoginModal(false)
              } else {
                showToastMsg("Login failed.")
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
              <button onClick={handleUpload}>Upload</button>
              <button onClick={() => setShowConfirmationModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && photoToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this photo?</p>
            <div className="modal-actions">
              <button
              className="modal-upload"
              onClick={() => {
                handleDelete(photoToDelete.filename)
                setShowDeleteModal(false)
                setPhotoToDelete(null)
              }}>Confirm</button>
              <button 
                className="modal-cancel"
                onClick={() => {
                  setShowDeleteModal(false)
                  setPhotoToDelete(null)
                }}>Cancel</button>
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

      {toastVisible && (
        <div className={`toast-msg ${toastHide ? "hide" : ""}`}>
          {toastMessage}
        </div>
      )}

      <section className="gallery">
        <h2>Showcase Gallery</h2>
        <div className={`photo-grid ${fadeClass}`}>
          {photos.map((photo, i) => (
            <div key={photo?.id || `placeholder-${i}`} className="photo-card">
              {photo ? (
              <div className="photo-wrapper">
                <img src={`http://localhost:773/images/${photo.filename}`} alt={photo.alt} onClick={() => setZoomedPhoto(photo)} style={{cursor: "zoom-in"}} />
                {deleting === photo.filename ? (
                  <span className="del-text">Deleting...</span>
                ) : (
                  <>
                  {isLoggedIn && (
                    <button className="delete-btn" data-testid="del-btn" onClick={() => {
                      setPhotoToDelete(photo)
                      setShowDeleteModal(true)
                    }}>
                      <FaTrashAlt size={16} />
                    </button>
                  )}
                  </>
                )}    
                <div className="photo-overlay">
                  {photo.description && <div className="overlay-text">{photo.description}</div>}
                </div>
              </div>
            ) : (
              <div className="photo-wrapper empty-slot" />
            )}
            </div>
          ))}
        </div>
      </section>

      <div className="pagination">
        <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        >Prev</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        >Next</button>
      </div>

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

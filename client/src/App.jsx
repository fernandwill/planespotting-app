// client/App.jsx

import { useEffect, useState } from "react";
import "./App.css"

// const photos which are arrays [] with id, filename, and alt text for each photos
const photos = [
  {
    id: "1",
    filename: "A6-ENV.jpg",
    alt: "Emirates Boeing 777-300ER || A6-ENV",
  },

  {
    id: "2",
    filename: "9V-SGA.jpg",
    alt: "Singapore Airlines Airbus A350-900 || 9V-SGA",
  },

  {
    id: "3",
    filename: "JA784A.jpg",
    alt: "All Nippon Airways Boeing 777-300ER || JA784A",
  },
]

function App () {
  const [photos, setPhotos] = useState([])
  const [file, setFile] = useState(null)
  const [alt, setAlt] = useState("")

  useEffect(() => {
    // This is to fetch photo from the backend API
    fetch("http://localhost:773/api/photos")
    .then(res => res.json())
    .then(data => setPhotos(data))
    .catch(err => console.error("Error fetching photos", err))
  }, [])

  const handleUpload = async e => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("images", file)
    formData.append("alt", alt)

    const res = await fetch("http://localhost:773/upload", {
      method: "POST",
      body: formData
    })

    if (res.ok){
      const data = await res.json()
      setPhotos(prev => [...prev, {filename: data.filename, alt}])
      setFile(null)
      setAlt("")
    } else {
      alert("Upload failed")
    }
  }

  return ( 
    <div className="app">
      <header>
        <h1>Planespotter's Gallery</h1>
        <p>A beginner's guide to spotting planes around the world.</p>
      </header>

      <form data-testid="submit-form" onSubmit={handleUpload}>
        <input type="file" accept="images/*" onChange={e => setFile(e.target.files[0])} required />
        <input type="text" placeholder="Alt text" value={alt} onChange={e => setAlt(e.target.value)} required />
        <button type="submit">Upload</button>
      </form>

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
            <button className="delete-btn" data-testid="del-btn" onClick={() => handleDelete(photo.filename)}>🗑️</button>
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
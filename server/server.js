// server/server.js

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const pool = require("./db"); 
const app = express();
const PORT = 773
const session = require("express-session")

// Middleware to allow JSON parsing
app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173", // Client URL
  credentials: true
}))

app.use(session({
  secret: "planespotting-secret", // Use a random secret if real case
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false} // Set to true if using HTTPS
}))

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

// User config
const USER = {
  username: "admin",
  password: "AirbusA330941"
}

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "images")) // Save to /images/ folder
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname
        cb(null, uniqueName)
    }
})

// Pass storage to multer
const upload = multer({storage})

const handleUpload = async e => {
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
        alt: alt,
        description: description
    }])
    setSelectedFile(null)
    setAlt("")
    setDesc("")
    setWatermark(false)
    } else {
    alert("Upload failed.")
    }
}

const handleDelete = async (filename) => {
    const res = await fetch(`http://localhost:773/api/photos/${filename}`, {
        method: "DELETE"
    })

    if (res.ok) {
        setPhotos(prev => prev.filter(p => p.filename !== filename))
    } else {
        alert("Failed to delete photo")
    }
}

// This make the folder publicly accessible at /images // Static file routing to serve images
app.use("/images", express.static(path.join(__dirname, "images")))

// Basic routing
app.get("/", (req, res) => {
    res.send("Planespotting API is live ✈️")
})

app.get("/check-auth", (req, res) => {
  res.json({loggedIn: !!req.session.user})
})

app.get("/api/photos", async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 8
  const offset = (page - 1) * limit
    try {
        const result = await pool.query("SELECT * FROM photos ORDER BY id DESC LIMIT $1 OFFSET $2", [limit, offset]
        )

        const countResult = await pool.query("SELECT COUNT(*) FROM photos")
        const totalPhotos = parseInt(countResult.rows[0].count)
        const totalPages = Math.ceil(totalPhotos / limit)

        res.json ({
          photos: result.rows,
          currentPage: page,
          totalPages,
          totalPhotos
        })
    } catch (err) {
        console.error(err)
        res.status(500).send("Server error")
    }
})

// Login route
app.post("/login", (req, res) => {
  const {username, password} = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({success: true});
} else {
  res.status(401).json({error: "Invalid credentials"});
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy()
  res.json({success: true})
})

app.get("/check-auth", (req, res) => {
  res.json({loggedIn: !!req.session.user})
})

app.post("/upload", upload.single("images"), async (req, res) => {
    try {
      const { alt, description, watermark, position } = req.body
      const file = req.file
  
      if (!file) {
        return res.status(400).json({ error: "No file uploaded." })
      }

      if (!req.session.user) {
        return res.status(403).json({error: "Not logged in."})
      }
  
      const outputFilename = `${Date.now()}-${file.originalname}`
      const outputPath = path.join(__dirname, "images", outputFilename)
  
      let insertedPhoto = null
      try {
        const result = await pool.query(
          "INSERT INTO photos (filename, alt, description) VALUES ($1, $2, $3) RETURNING *",
          [outputFilename, alt, description]
        )
        insertedPhoto = result.rows[0]
      } catch (err) {
        if (err.code === "23505") {
          console.log("Duplicate filename, skipping DB insertion.")
        } else {
          throw err
        }
      }
  
      if (watermark === "true") {
        const watermarkPath = path.join(__dirname, "watermark.png")
        const watermarkBuffer = await sharp(watermarkPath).resize(100).toBuffer()
  
        const image = sharp(file.path)
        const { width, height } = await image.metadata()
  
        let left = 10, top = 10
        switch (position) {
          case "top-right":
            left = width - 110
            break
          case "bottom-left":
            top = height - 110
            break
          case "bottom-right":
            left = width - 110
            top = height - 110
            break
          case "center":
            left = Math.floor((width - 100) / 2)
            top = Math.floor((height - 100) / 2)
            break
          default:
            break
        }
  
        await image.composite([{ input: watermarkBuffer, top, left }]).toFile(outputPath)
      } else {
        fs.renameSync(file.path, outputPath)
      }
  
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
  
      // ✅ Return photo info (required by React app)
      res.json({ success: true, photo: {
        id: insertedPhoto.id,
        filename: outputFilename,
        alt: alt,
        description: description
      } 
    })
    } catch (err) {
      console.error("Upload error:", err)
      res.status(500).json({ error: "Upload failed." })
    }
  })
  

app.delete("/api/photos/:filename", async (req, res) => {
    const { filename } = req.params

    if (!req.session.user) {
      return res.status(403).json({error: "Not logged in."})
    }

    try {
        // Delete from database
        await pool.query('DELETE FROM photos WHERE filename = $1', [filename])

        // Delete from disk
        const filePath = path.join(__dirname, "images", filename)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

        res.status(200).json({message: "Photo deleted successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Failed to delete photo."})
    }
})

// To listen if server is live
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

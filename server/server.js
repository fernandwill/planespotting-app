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

// Middleware to allow JSON parsing
app.use(express.json())
app.use(cors())

// This make the folder publicly accessible at /images // Static file routing to serve images
app.use("/images", express.static(path.join(__dirname, "images")))

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
        alt,
        description: desc
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

// Basic routing
app.get("/", (req, res) => {
    res.send("Planespotting API is live ✈️")
})

app.get("/api/photos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM photos")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).send("Server error")
    }
})

app.post("/api/upload", upload.single("images"), async (req, res) => {
    try {
        const { alt, desc, watermark, position, cropX, cropY, cropWidth, cropHeight } = req.body
        const filename = req.file.filename
        const outputFilename = `${Date.now()}-${file.originalname}`
        const outputPath = path.join(__dirname, "uploads", outputFilename)

        if (watermark == "true") {
            const watermarkPath = path.join(__dirname, "watermark.png")
            const watermarkBuffer = await sharp(watermarkPath).resize(100).toBuffer()

            const image = sharp(file.path)
            const {width, height} = await image.metadata()

            // Calculate watermark position
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

                    default: break
            }

            await image
            .composite([{ input: watermarkBuffer, top, left}])
            .toFile(outputPath)
        } else {
            // Just move file as-is if no watermark
            fs.renameSync(file.path, outputPath)
        }

        // Delete temp file if exists
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)

        // Save to DB here if needed
        res.json({success: true, filename: outputFilename})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Upload failed."})
    }
})


app.delete("/api/photos/:filename", async (req, res) => {
    const { filename } = req.params

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
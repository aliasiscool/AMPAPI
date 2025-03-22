import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post("/upload", async (req, res) => {
  try {
    const { image_urls = [], folder = "default_album" } = req.body;

    if (!Array.isArray(image_urls) || image_urls.length === 0) {
      return res.status(400).json({ error: "No image URLs provided." });
    }

    const uploadPromises = image_urls.map((url) =>
      cloudinary.uploader.upload(url, {
        folder,
      })
    );

    const results = await Promise.all(uploadPromises);

    const uploadedLinks = results.map((r) => r.secure_url);

    return res.status(200).json({
      message: "✅ Images uploaded successfully",
      gallery: uploadedLinks,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: "Upload failed", details: err });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server live on port ${PORT}`);
});

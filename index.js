import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const IMGUR_ACCESS_TOKEN = process.env.IMGUR_ACCESS_TOKEN;

// POST endpoint for uploading images
app.post("/upload-images", async (req, res) => {
  const { image_urls, album_hash } = req.body;

  if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
    return res.status(400).json({ error: "No image URLs provided." });
  }

  if (!album_hash) {
    return res.status(400).json({ error: "Missing album_hash." });
  }

  const uploadedHashes = [];

  for (let i = 0; i < image_urls.length; i++) {
    const image_url = image_urls[i];

    try {
      // Upload image to Imgur
      const uploadResponse = await axios.post(
        "https://api.imgur.com/3/image",
        new URLSearchParams({
          image: image_url,
          type: "url"
        }),
        {
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      const uploadedHash = uploadResponse.data.data.id;
      uploadedHashes.push(uploadedHash);

      // Add image to album
      await axios.post(
        `https://api.imgur.com/3/album/${album_hash}/add`,
        new URLSearchParams({ [`ids[]`]: uploadedHash }),
        {
          headers: {
            Authorization: `Bearer ${IMGUR_ACCESS_TOKEN}`,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

    } catch (err) {
      console.error("❌ Failed to upload image or add to album:", image_url, err.response?.data || err.message);
    }
  }

  const albumLink = `https://imgur.com/a/${album_hash}`;
  return res.json({
    message: `✅ ${uploadedHashes.length} image(s) uploaded successfully`,
    album: albumLink,
    uploaded: uploadedHashes
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));

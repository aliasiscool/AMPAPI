import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 10000;
app.use(bodyParser.json());

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const IMGUR_ACCESS_TOKEN = process.env.IMGUR_ACCESS_TOKEN;

const delay = (ms) => new Promise(res => setTimeout(res, ms));

app.post("/upload", async (req, res) => {
  const { image_urls, album_hash } = req.body;

  if (!image_urls || !album_hash) {
    return res.status(400).json({ error: "Missing image_urls or album_hash" });
  }

  const imageArray = image_urls.split(",").map(url => url.trim());
  const uploadedImageIds = [];

  for (const url of imageArray) {
    try {
      // Upload the image
      const uploadRes = await axios.post(
        "https://api.imgur.com/3/image",
        new URLSearchParams({
          image: url,
          type: "url",
        }),
        {
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
        }
      );

      const imageId = uploadRes.data.data.id;
      uploadedImageIds.push(imageId);
      console.log("✅ Uploaded:", imageId);

      // Add to album
      await axios.post(
        `https://api.imgur.com/3/album/${album_hash}/add`,
        new URLSearchParams({ "ids[]": imageId }),
        {
          headers: {
            Authorization: `Bearer ${IMGUR_ACCESS_TOKEN}`,
          },
        }
      );

      console.log(`✅ Added image ${imageId} to album`);
      await delay(1000); // wait 1 second between uploads

    } catch (err) {
      console.error("❌ Upload/Add failed for", url);
      console.error(err.response?.data || err.message);
    }
  }

  return res.json({
    success: true,
    uploaded: uploadedImageIds.length,
    album_url: `https://imgur.com/a/${album_hash}`,
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🔥 Server listening on port ${PORT}`);
});


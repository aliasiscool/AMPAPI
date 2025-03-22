const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 10000;

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const IMGUR_ACCESS_TOKEN = process.env.IMGUR_ACCESS_TOKEN;

app.use(bodyParser.json());

app.post('/upload', async (req, res) => {
    const { image_urls, album_hash } = req.body;

    if (!image_urls || !album_hash) {
        return res.status(400).json({ error: 'Missing image_urls or album_hash' });
    }

    const urls = image_urls.split(',').map(url => url.trim());

    // Respond right away so Voiceflow doesn't timeout
    res.status(200).json({ message: 'Uploading started' });

    for (const url of urls) {
        try {
            const form = new FormData();
            form.append('image', url);
            form.append('type', 'url');
            form.append('album', album_hash);

            await axios.post('https://api.imgur.com/3/image', form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`  // or Bearer token
                }
            });

            console.log(`✅ Uploaded to album: ${url}`);
        } catch (error) {
            console.error(`❌ Failed to upload ${url}:`, error.response?.data || error.message);
        }
    }

    console.log('✅ All uploads attempted.');
});

app.listen(PORT, () => {
    console.log(`🚀 Server ready on port ${PORT}`);
});

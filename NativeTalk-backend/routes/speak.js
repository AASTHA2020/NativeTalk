const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // ✅ load .env



// Murf API Key (hardcoded as per instructions)
const MURF_API_KEY = process.env.MURF_API_KEY 


// POST /speak
// Expects: { text: string, voice: string, language: string }
router.post('/', async (req, res) => {
  const { text, voice, language } = req.body;
  try {
    // Example Murf API endpoint and payload (update as per Murf API docs)
    const response = await axios.post(
      'https://api.murf.ai/v1/speech/generate',
      {
        text,
        voice,
        language
      },
      {
        headers: {
          'Authorization': `Bearer ${MURF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Return the audio URL or file buffer
    res.json({ audioUrl: response.data.audioUrl || response.data.url, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

module.exports = router; 
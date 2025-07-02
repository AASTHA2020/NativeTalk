const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

console.log('[DEBUG] Loaded dependencies and initialized router');

const MURF_API_KEY = process.env.MURF_API_KEY;
console.log('[DEBUG] MURF_API_KEY loaded:', !!MURF_API_KEY);


console.log('[DEBUG] MURF_API_KEY:', MURF_API_KEY);


router.post('/', async (req, res) => {
  console.log('[DEBUG] POST /generate-audio called');
  const { text, voice_id, mode } = req.body;
  console.log('[DEBUG] Request body:', req.body);

  if (!MURF_API_KEY) {
    console.log('[ERROR] Murf API key is missing.');
    return res.status(500).json({ error: 'Murf API key is missing.' });
  }

  if (!text || !voice_id) {
    console.log('[ERROR] Missing required fields: text or voice_id.');
    return res.status(400).json({ error: 'Missing required fields: text or voice_id.' });
  }

  let selectedVoiceId = voice_id;
  let speed;
  console.log('[DEBUG] Initial voice_id:', voice_id, 'mode:', mode);

  if (mode === 'slow') {
    speed = 'slow';
    console.log('[DEBUG] Mode is slow, speed set to slow');
  }
  if (mode === 'alternate') {
    selectedVoiceId = voice_id.endsWith('-1') ? voice_id.replace('-1', '-2') : voice_id.replace('-2', '-1');
    console.log('[DEBUG] Mode is alternate, selectedVoiceId:', selectedVoiceId);
  }

  try {
    const payload = {
      text,
      voice_id: selectedVoiceId,
      ...(speed && { speed }), // add only if present
    };
    console.log('[DEBUG] Payload to Murf API:', payload);

    const response = await axios.post(
      'https://api.murf.ai/v1/speech/generate',
      payload,
      {
        headers: {
'Authorization': `Bearer ${MURF_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('[DEBUG] Murf API response status:', response.status);
    console.log('[DEBUG] Murf API response data:', response.data);

    const audioUrl = response.data.audioUrl || response.data.url;
    console.log('[DEBUG] audioUrl:', audioUrl);

    if (!audioUrl) {
      console.log('[ERROR] No audio URL returned from Murf.');
      return res.status(502).json({ error: 'No audio URL returned from Murf.' });
    }

    res.json({ audioUrl, data: response.data });
    console.log('[DEBUG] Response sent to client');
  } catch (error) {
    console.error("[ERROR] 💥 Full Murf API error:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });
    return res.status(500).json({
      error: "Murf API request failed",
      details: error.response?.data || error.message,
    });
  }
});

console.log('[DEBUG] Exporting router');
module.exports = router;

const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // ✅ load .env
console.log('[DEBUG] .env loaded');

const MURF_API_KEY = process.env.MURF_API_KEY;
console.log('[DEBUG] MURF_API_KEY:', !!MURF_API_KEY);

console.log('[DEBUG] MURF_API_KEY:', MURF_API_KEY);

router.post('/', async (req, res) => {
  console.log('[DEBUG] POST / called');
  if (!MURF_API_KEY) {
    console.log('[ERROR] Murf API key missing');
    return res.status(500).json({ error: 'Murf API key is missing. Please set MURF_API_KEY in your .env file.' });
  }
  const { text, language_code, voice_id, mode } = req.body;
  console.log('[DEBUG] Request body:', req.body);

  if (!text || !voice_id || !language_code) {
    console.log('[ERROR] Missing required fields:', { text, voice_id, language_code });
    return res.status(400).json({ error: 'Missing required fields: text, voice_id, language_code.' });
  }

  let speed;
  let selectedVoiceId = voice_id;
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
      language_code,
    };
    if (speed) {
      payload.speed = speed;
      console.log('[DEBUG] Speed added to payload:', speed);
    }
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
    console.log('[DEBUG] Murf API response:', response.data);

    res.json({ audioUrl: response.data.audioUrl || response.data.url, data: response.data });
    console.log('[DEBUG] Response sent to client');
  } catch (error) {
    console.error('[ERROR] Murf API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Murf API request failed', details: error.response?.data || error.message });
    console.log('[DEBUG] Error response sent to client');
  }
});

console.log('[DEBUG] speak.js router loaded');
module.exports = router;
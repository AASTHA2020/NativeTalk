// routes/explain.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // ✅ load .env
console.log('[DEBUG-1] .env loaded');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log('[DEBUG-2] OPENAI_API_KEY:', !!OPENAI_API_KEY);



router.post('/', async (req, res) => {
  console.log('[DEBUG-3] POST /explain called');
  const { text, language, mode } = req.body;
  console.log('[DEBUG-4] req.body:', req.body);

  try {
    const prompt =
      mode === 'translate'
        ? `Translate the following sentence to ${language}: ${text}`
        : `Explain the following sentence in simple terms: ${text}`;
    console.log('[DEBUG-5] prompt:', prompt);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('[DEBUG-6] OpenAI API response received');

    res.json({ result: response.data.choices[0].message.content });
    console.log('[DEBUG-7] Response sent to client');
  } catch (error) {
    console.log('[DEBUG-8] Error occurred:', error.message);
    if (error.response) {
      console.log('[DEBUG-9] Error response data:', error.response.data);
    }
    res.status(500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

console.log('[DEBUG-10] explain.js router loaded');
module.exports = router;

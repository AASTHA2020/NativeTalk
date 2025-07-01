// routes/explain.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config(); // ✅ load .env

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// POST /explain
// Expects: { text: string, language: string, mode: 'explain' | 'translate' }
router.post('/', async (req, res) => {
  const { text, language, mode } = req.body;

  try {
    const prompt =
      mode === 'translate'
        ? `Translate the following sentence to ${language}: ${text}`
        : `Explain the following sentence in simple terms: ${text}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ result: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

module.exports = router;

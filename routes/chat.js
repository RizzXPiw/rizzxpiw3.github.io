const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/chat', async (req, res) => {
    try {
        const response = await fetch('https://ai-rizzpiw.vercel.app/');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;

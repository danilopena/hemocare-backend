const express = require('express');

const router = express.Router();
const fs = require('fs');

router.get('/useTerms', (req, res) => {
    fs.readFile('./terms.html', (err, html) => {
        if (err) {
            console.log(err);
        }
        res.json({ texto: html.toString() });
    });
});

module.exports = router;

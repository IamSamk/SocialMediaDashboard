const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.send('X.com API route working');
});

module.exports = router;

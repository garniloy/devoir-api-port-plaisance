var express = require('express');
var router = express.Router();


const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/documentation.html'));
});

router.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/doc-user.html'));
});

router.get('/catways', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/doc-catway.html'));
});

router.get('/reservations', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/doc-reservation.html'));
});
module.exports = router;
const express = require('express');
const mainHandler = require('../handlers/main_handler');

const router = express.Router();

router.get('/', mainHandler.home);

router.post('/upload', mainHandler.upload);

router.post('/insert', mainHandler.insert);

module.exports = router;
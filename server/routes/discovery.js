'use strict';

const
    express = require('express'),
    discoveryController = require('../controllers/apis/discovery');

let router = express.Router();

router.use('/', discoveryController);

module.exports = router;
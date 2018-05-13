'use strict';

const
    express = require('express'),
    taxii2ApiController = require('./taxii2');

let router = express.Router();

router.use('/', taxii2ApiController);

module.exports = router;